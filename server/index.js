/**
 * Castillo de España - Backend Server
 * Handles Ticket Management, Payments, and Historical Data
 * Based on Alibek_Tugel_CTT.pdf and Requirement Analysis
 * 
 * Tech Stack: Node.js/Express, Stripe, SQLite, Google Maps API
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const paymentRoutes = require('./routes/paymentRoutes');
const mapController = require('./controllers/mapController');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Parse JSON bodies (for most routes)
app.use(express.json());
// Add this AFTER express.json() middleware
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/payments/create-payment-intent') {
    console.log('📨 Raw body received:', req.body);
    console.log('📨 Content-Type:', req.headers['content-type']);
  }
  next();
});

// ========================================
// API ROUTES
// ========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ticket prices endpoint (replaces mock data)
app.get('/api/tickets', async (req, res) => {
    try {
        // Dynamic import to avoid circular dependency
        const { dbPromise } = require('./config/database');
        
        // Get price configuration from environment or use defaults
        const prices = {
            adult: parseInt(process.env.PRICE_ADULT) || 1500,
            child: parseInt(process.env.PRICE_CHILD) || 800,
            family: parseInt(process.env.PRICE_FAMILY) || 3500
        };
        
        const ticketTypes = [
            { id: 'adult', name: 'Adult', price: prices.adult / 100, currency: 'EUR' },
            { id: 'child', name: 'Child (6-12 years)', price: prices.child / 100, currency: 'EUR' },
            { id: 'family', name: 'Family Pack (2 adults + 2 children)', price: prices.family / 100, currency: 'EUR' }
        ];
        
        res.json({
            success: true,
            tickets: ticketTypes
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Payment routes (Stripe integration)
app.use('/api/payments', paymentRoutes);

// Map routes (with Google Maps integration)
app.get('/api/map/points', (req, res) => mapController.getAllPoints(req, res));
app.get('/api/map/points/:id', (req, res) => mapController.getPointDetails(req, res));
app.get('/api/map/points/type/:type', (req, res) => mapController.getPointsByType(req, res));

// Google Maps API endpoints
app.get('/api/map/geocode', (req, res) => mapController.geocodeAddress(req, res));
app.get('/api/map/directions', (req, res) => mapController.getDirections(req, res));
app.get('/api/map/static-map', (req, res) => mapController.getStaticMap(req, res));
app.get('/api/map/nearby-places', (req, res) => mapController.getNearbyPlaces(req, res));

// ========================================
// HISTORICAL CONTENT (Sofia's use case)
// ========================================

// Detailed historical data for research mode
const historicalData = {
    "main_tower": {
        id: "main_tower",
        name: "Main Tower",
        style: "Mudejar/Renaissance",
        history: "Built in the 12th century, this tower served as both a defensive structure and the residence of the castle's governor. The blend of Mudejar and Renaissance architectural elements reflects the cultural transitions of medieval Spain.",
        constructionDate: "1145-1162",
        architect: "Unknown Moorish craftsmen, later expanded by Christian rulers",
        plans: "/assets/plans/main_tower_blueprint.pdf",
        images: ["/images/tower_main_1.jpg", "/images/tower_main_2.jpg"],
        funFacts: [
            "The tower contains a secret passage leading to the river",
            "During the 14th century, it held 32 prisoners of war"
        ]
    },
    "north_gate": {
        id: "north_gate",
        name: "North Gate",
        style: "Romanesque",
        history: "The main entrance point for traders and merchants during the medieval period. The massive iron-reinforced doors are original from 1289.",
        constructionDate: "1250-1275",
        architect: "Master Builder Pedro Ruiz",
        images: ["/images/gate_north.jpg"]
    },
    "south_tower": {
        id: "south_tower",
        name: "South Watchtower",
        style: "Gothic",
        history: "Added during the 14th century as a lookout point. Offers the best panoramic view of the surrounding valley.",
        constructionDate: "1310-1325",
        images: ["/images/tower_south.jpg"]
    }
};

// POI endpoint (updated with more data)
app.get('/api/map/:poiId', (req, res) => {
    const poi = historicalData[req.params.poiId];
    
    if (poi) {
        res.json({
            success: true,
            data: poi
        });
    } else {
        // Try to get from database if not in static data
        mapController.getPointDetails(req, res);
    }
});

// Search historical content
app.get('/api/historical/search', async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ 
            success: false, 
            error: 'Search query required' 
        });
    }
    
    const results = Object.values(historicalData).filter(poi => 
        poi.name.toLowerCase().includes(q.toLowerCase()) ||
        (poi.history && poi.history.toLowerCase().includes(q.toLowerCase()))
    );
    
    res.json({
        success: true,
        query: q,
        results: results.map(r => ({
            id: r.id,
            name: r.name,
            style: r.style,
            preview: r.history ? r.history.substring(0, 200) + '...' : null
        }))
    });
});

// Get all historical POIs (for list view)
app.get('/api/historical/pois', (req, res) => {
    const list = Object.values(historicalData).map(poi => ({
        id: poi.id,
        name: poi.name,
        style: poi.style,
        constructionDate: poi.constructionDate
    }));
    
    res.json({
        success: true,
        count: list.length,
        points: list
    });
});

// ========================================
// SUPPORT & FAQ (Questions endpoint)
// ========================================

const faqData = [
    {
        id: 1,
        question: "What are the castle opening hours?",
        answer: "The castle is open daily from 10:00 AM to 7:00 PM (April-September) and 10:00 AM to 5:00 PM (October-March). Last entry is 1 hour before closing."
    },
    {
        id: 2,
        question: "Is the castle accessible for wheelchairs?",
        answer: "Yes, the main areas of the castle are wheelchair accessible. We have elevators and ramps throughout. Please contact us in advance if you need special assistance."
    },
    {
        id: 3,
        question: "Can I cancel or change my ticket?",
        answer: "Tickets can be cancelled up to 24 hours before your visit for a full refund. Changes to the visit date are free of charge up to 48 hours before the original date."
    },
    {
        id: 4,
        question: "Are guided tours available?",
        answer: "Yes, guided tours are available in English, Spanish, and French. Tours run at 11:00 AM, 1:00 PM, and 3:00 PM. Book at the entrance or online in advance."
    },
    {
        id: 5,
        question: "Is there parking near the castle?",
        answer: "Yes, there is free parking for 200 cars just 300m from the main entrance. Accessible parking spaces are available near the gate."
    }
];

app.get('/api/support/faq', (req, res) => {
    res.json({
        success: true,
        faq: faqData
    });
});

app.get('/api/support/faq/:id', (req, res) => {
    const faq = faqData.find(f => f.id === parseInt(req.params.id));
    
    if (faq) {
        res.json({ success: true, faq });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'FAQ not found' 
        });
    }
});

// Contact form endpoint
app.post('/api/support/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required'
        });
    }
    
    // In production, send email here
    console.log(`Contact form submission from ${name} (${email}): ${message}`);
    
    res.json({
        success: true,
        message: 'Your message has been sent. We will respond within 24 hours.'
    });
});

// ========================================
// VIRTUAL GUIDE (Audio/Video content)
// ========================================

const virtualGuideContent = {
    welcome: {
        title: "Welcome to Castillo de España",
        duration: "2:30",
        audioUrl: "/audio/welcome.mp3",
        transcript: "Welcome to the magnificent Castillo de España..."
    },
    history: {
        title: "The History of the Castle",
        duration: "5:00",
        audioUrl: "/audio/history.mp3",
        videoUrl: "/video/history_tour.mp4"
    },
    architecture: {
        title: "Architectural Highlights",
        duration: "3:45",
        audioUrl: "/audio/architecture.mp3"
    }
};

app.get('/api/guide/content', (req, res) => {
    res.json({
        success: true,
        content: virtualGuideContent
    });
});

app.get('/api/guide/content/:id', (req, res) => {
    const content = virtualGuideContent[req.params.id];
    
    if (content) {
        res.json({ success: true, content });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Content not found' 
        });
    }
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.url} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        // Initialize database
        await initDatabase();
        
        // Initialize map test data
        await mapController.initTestData();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`-----------------------------------------------`);
            console.log(`🏰 Castillo de España Backend Server`);
            console.log(`-----------------------------------------------`);
            console.log(`✅ Running on http://localhost:${PORT}`);
            console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing key'}`);
            console.log(`🗺️  Google Maps: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configured' : '⚠️  Optional'}`);
            console.log(`💾 Database: SQLite (${process.env.SQLITE_DB_PATH || './castle.db'})`);
            console.log(`-----------------------------------------------`);
            console.log(`📡 API Endpoints:`);
            console.log(`   GET  /api/health`);
            console.log(`   GET  /api/tickets`);
            console.log(`   POST /api/payments/create-payment-intent`);
            console.log(`   GET  /api/map/points`);
            console.log(`   GET  /api/support/faq`);
            console.log(`   GET  /api/guide/content`);
            console.log(`-----------------------------------------------`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();