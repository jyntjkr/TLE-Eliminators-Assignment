const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cronJobs = require('./utils/cronJobs');

// Import routes
const studentRoutes = require('./routes/students');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 