require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cronJobs = require('./utils/cronJobs');

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const syncRoutes = require('./routes/sync');
const inactivityRoutes = require('./routes/inactivityRoutes');
const emailTestRoutes = require('./routes/emailTestRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  // Initialize cron jobs after database connection
  cronJobs.initializeSyncJob();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/inactivity', inactivityRoutes);
app.use('/api/email-test', emailTestRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    routes: {
      emailTest: '/api/email-test',
      sync: '/api/sync',
      students: '/api/students'
    }
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
    availableRoutes: [
      '/api/health', 
      '/api/email-test', 
      '/api/sync', 
      '/api/students'
    ]
  });
});

// Make sure to initialize email service at startup
const emailService = require('./services/emailService');
emailService.testConnection()
  .then(result => {
    if (result) {
      console.log('📧 Email service connected successfully');
    } else {
      console.warn('⚠️ Email service failed to connect');
    }
  })
  .catch(error => {
    console.error('🔥 Email service error:', error.message);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

module.exports = app;