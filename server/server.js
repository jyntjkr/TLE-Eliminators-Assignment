// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const codeforcesRoutes = require('./routes/codeforcesRoutes');
const syncRoutes = require('./routes/sync');
const emailTestRoutes = require('./routes/emailTestRoutes');
const inactivityRoutes = require('./routes/inactivityRoutes');
const cronJobs = require('./utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
console.log('Registering routes...');
app.use('/api/students', studentRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/email-test', emailTestRoutes);
app.use('/api/inactivity', inactivityRoutes);
console.log('Routes registered.');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/students');
    console.log('- GET /api/students');
    console.log('- GET /api/students/:id');
    console.log('- PUT /api/students/:id');
    console.log('- DELETE /api/students/:id');
    console.log('- POST /api/sync/trigger');
    console.log('- GET /api/sync/settings');
    console.log('- PUT /api/sync/settings');
    console.log('- GET /api/email-test/test-setup');
    console.log('- POST /api/email-test/send-test');
    console.log('- GET /api/inactivity/stats');
    console.log('- GET /api/inactivity/inactive');
    console.log('- GET /api/inactivity/reminders/:id');
    console.log('- PUT /api/inactivity/toggle-reminders/:id');
    console.log('- POST /api/inactivity/test-reminder/:id');
    
    // Initialize cron jobs
    cronJobs.initializeSyncJob();
});