const express = require('express');
const router = express.Router();
const inactivityController = require('../controllers/inactivityController');
const inactivityService = require('../services/inactivityService');
const emailService = require('../services/emailService');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');

// Get inactivity statistics
router.get('/stats', inactivityController.getInactivityStats);

// Get inactive students list
router.get('/inactive', inactivityController.getInactiveStudents);

// Get reminder history for a student
router.get('/reminders/:id', inactivityController.getReminderHistory);

// Toggle email reminders for a student
router.put('/toggle-reminders/:id', inactivityController.toggleEmailReminders);

// Send a test reminder to a student
router.post('/test-reminder/:id', inactivityController.sendTestReminder);

// Add this to your existing routes
router.get('/test-email', async (req, res) => {
  try {
    const result = await emailService.testConnection();
    
    // Create a simple test email
    const testResult = await emailService.transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: req.query.email || process.env.EMAIL_USER, // Use query param or send to yourself
      subject: 'Email Service Test',
      html: '<h1>Email Service Test</h1><p>This is a test email to verify that the email service is working correctly.</p>'
    });
    
    res.json({
      success: true,
      connectionTest: result,
      emailSent: testResult,
      message: 'Email service test completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service test failed',
      error: error.message
    });
  }
});

// Add this to your existing routes
router.get('/check-email-config', async (req, res) => {
  try {
    // Test the email connection
    const connectionResult = await emailService.testConnection();
    
    // Get configuration (without sensitive data)
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.EMAIL_USER,
      hasPassword: Boolean(process.env.EMAIL_PASSWORD),
      connectionSuccessful: connectionResult
    };
    
    res.json({
      success: true,
      config,
      message: connectionResult ? 
        'Email configuration is valid' : 
        'Email connection failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking email configuration',
      error: error.message
    });
  }
});

// Add this to your routes
router.post('/run-check', async (req, res) => {
  try {
    const students = await Student.find({});
    const studentsData = [];
    
    // Get codeforces data for each student
    for (const student of students) {
      const data = await CodeforcesData.findOne({ studentId: student._id });
      if (data) {
        studentsData.push({
          studentId: student._id,
          submissions: data.submissions
        });
      }
    }
    
    // Process inactivity for all students
    const results = await inactivityService.processInactivityForAllStudents(studentsData);
    
    res.json({
      success: true,
      message: 'Inactivity check completed',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Inactivity check failed',
      error: error.message
    });
  }
});

// Add this to your existing routes
router.post('/send-test-email', async (req, res) => {
  try {
    const { recipient } = req.body;
    
    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required'
      });
    }
    
    const result = await emailService.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: 'Test Email from Student Management System',
      html: `
        <h1>SMTP Configuration Test</h1>
        <p>This is a test email sent at ${new Date().toLocaleString()}</p>
        <p>If you received this, your SMTP configuration is working correctly!</p>
      `
    });
    
    res.json({
      success: true,
      message: `Test email sent to ${recipient}`,
      messageId: result.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Add this as a new route
router.get('/test-email-setup', async (req, res) => {
  try {
    const testResult = await emailService.testConnectionWithDetails();
    res.json({
      success: testResult.success,
      message: testResult.message,
      details: testResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

module.exports = router;