// controllers/stripeController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbPromise } = require('../config/database');
const QRCode = require('qrcode');

// Price configuration (in cents)
const PRICES = {
  adult: 1500,     // €15.00
  child: 800,      // €8.00
  family: 3500     // €35.00
};

// Helper: Get price for ticket type
const getPrice = (ticketType, quantity = 1) => {
  const basePrice = PRICES[ticketType];
  if (!basePrice) return null;
  
  if (ticketType === 'family') {
    return basePrice;
  }
  
  return basePrice * quantity;
};

// 1. Create Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { ticketType, quantity = 1, visitDate, email, name, phone } = req.body;
    
    // Validation
    if (!ticketType || !visitDate || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: ticketType, visitDate, email' 
      });
    }
    
    const amount = getPrice(ticketType, quantity);
    if (!amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid ticket type' 
      });
    }
    
    // Validate date
    const selectedDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Please select a future date'
      });
    }
    
    // Create Payment Intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      metadata: {
        ticketType,
        quantity: quantity.toString(),
        visitDate,
        email,
        name: name || 'Guest',
        phone: phone || ''
      },
      receipt_email: email,
      description: `${quantity}x ${ticketType} ticket(s) for Castle visit on ${visitDate}`,
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      }
    });
    
    // Save session for recovery
    const sessionId = req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await dbPromise.run(
      `INSERT OR REPLACE INTO booking_sessions (session_id, ticket_type, quantity, visit_date, email, name, phone, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, ticketType, quantity, visitDate, email, name || '', phone || '', amount]
    );
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100,
      currency: 'eur',
      sessionId
    });
    
  } catch (error) {
    console.error('Stripe create payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      type: error.type
    });
  }
};

// 2. Confirm payment and generate ticket
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, sessionId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment Intent ID required' 
      });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Check payment status
    if (paymentIntent.status === 'requires_action') {
      return res.status(400).json({
        success: false,
        error: 'Payment requires additional authentication (3D Secure)',
        requiresAction: true,
        clientSecret: paymentIntent.client_secret
      });
    }
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        error: `Payment not successful. Status: ${paymentIntent.status}`,
        status: paymentIntent.status
      });
    }
    
    // Get booking data from metadata or session
    let bookingData = paymentIntent.metadata;
    
    if ((!bookingData.ticketType || !bookingData.visitDate) && sessionId) {
      const session = await dbPromise.get(
        `SELECT * FROM booking_sessions WHERE session_id = ?`,
        [sessionId]
      );
      
      if (session) {
        bookingData = {
          ticketType: session.ticket_type,
          quantity: session.quantity || 1,
          visitDate: session.visit_date,
          email: session.email,
          name: session.name,
          phone: session.phone
        };
      }
    }
    
    // Generate QR code
    const qrPayload = JSON.stringify({
      ticketId: paymentIntentId,
      email: bookingData.email,
      visitDate: bookingData.visitDate,
      ticketType: bookingData.ticketType,
      quantity: bookingData.quantity || 1,
      amount: paymentIntent.amount / 100,
      issuedAt: new Date().toISOString()
    });
    
    const qrCode = await QRCode.toDataURL(qrPayload);
    
    // Save ticket to database
    const result = await dbPromise.run(
      `INSERT INTO tickets (
        payment_intent_id, user_email, user_name, user_phone, 
        pack_name, quantity, amount, visit_date, qr_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentIntentId,
        bookingData.email,
        bookingData.name || '',
        bookingData.phone || '',
        bookingData.ticketType,
        bookingData.quantity || 1,
        paymentIntent.amount,
        bookingData.visitDate,
        qrCode,
        'active'
      ]
    );
    
    // Clean up booking session
    if (sessionId) {
      await dbPromise.run('DELETE FROM booking_sessions WHERE session_id = ?', [sessionId]);
    }
    
    res.json({
      success: true,
      ticket: {
        id: result.lastID,
        qrCode: qrCode,
        packName: bookingData.ticketType,
        quantity: bookingData.quantity || 1,
        visitDate: bookingData.visitDate,
        amount: paymentIntent.amount / 100,
        email: bookingData.email,
        name: bookingData.name
      }
    });
    
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 3. Get saved booking session
const getBookingSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await dbPromise.get(
      `SELECT * FROM booking_sessions WHERE session_id = ?`,
      [sessionId]
    );
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    
    res.json({
      success: true,
      session: {
        ticketType: session.ticket_type,
        quantity: session.quantity || 1,
        visitDate: session.visit_date,
        email: session.email,
        name: session.name,
        phone: session.phone,
        amount: session.amount / 100
      }
    });
    
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 4. Cancel payment intent
const cancelPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    
    res.json({
      success: true,
      message: 'Payment cancelled',
      status: paymentIntent.status
    });
    
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 5. Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      lastError: paymentIntent.last_payment_error
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 6. Get ticket by ID
const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await dbPromise.get(
      `SELECT * FROM tickets WHERE id = ? OR payment_intent_id = ?`,
      [ticketId, ticketId]
    );
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found' 
      });
    }
    
    res.json({
      success: true,
      ticket: {
        id: ticket.id,
        qrCode: ticket.qr_code,
        packName: ticket.pack_name,
        quantity: ticket.quantity,
        visitDate: ticket.visit_date,
        amount: ticket.amount / 100,
        email: ticket.user_email,
        name: ticket.user_name,
        status: ticket.status,
        createdAt: ticket.created_at
      }
    });
    
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 7. Validate ticket at entrance
const validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await dbPromise.get(
      `SELECT * FROM tickets WHERE id = ? OR payment_intent_id = ?`,
      [ticketId, ticketId]
    );
    
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ticket not found' 
      });
    }
    
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        success: false, 
        error: 'Ticket already used',
        usedAt: ticket.used_at
      });
    }
    
    if (ticket.status === 'refunded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Ticket has been refunded'
      });
    }
    
    // Check if visit date is valid
    const visitDate = new Date(ticket.visit_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (visitDate < today) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ticket has expired'
      });
    }
    
    // Mark as used
    await dbPromise.run(
      `UPDATE tickets SET status = 'used', used_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [ticket.id]
    );
    
    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket: {
        packName: ticket.pack_name,
        quantity: ticket.quantity,
        visitDate: ticket.visit_date,
        validatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 8. Get prices
const getPrices = async (req, res) => {
  res.json({
    success: true,
    prices: {
      adult: PRICES.adult / 100,
      child: PRICES.child / 100,
      family: PRICES.family / 100
    },
    currency: 'EUR'
  });
};

// Export all functions (NO webhook handler)
module.exports = {
  createPaymentIntent,
  confirmPayment,
  getBookingSession,
  cancelPaymentIntent,
  getPaymentStatus,
  getTicket,
  validateTicket,
  getPrices
};