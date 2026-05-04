// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

// Public endpoints
router.get('/prices', stripeController.getPrices);
router.post('/create-payment-intent', stripeController.createPaymentIntent);
router.post('/confirm-payment', stripeController.confirmPayment);
router.get('/session/:sessionId', stripeController.getBookingSession);
router.get('/payment-status/:paymentIntentId', stripeController.getPaymentStatus);
router.get('/ticket/:ticketId', stripeController.getTicket);

// Validation endpoints
router.post('/validate-ticket/:ticketId', stripeController.validateTicket);
router.post('/cancel-payment/:paymentIntentId', stripeController.cancelPaymentIntent);

// NO webhook endpoint - removed

module.exports = router;