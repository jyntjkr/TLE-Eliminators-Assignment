const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Test email configuration
router.get('/test-setup', async (req, res) => {
  try {
    const result = await emailService.testConnectionWithDetails();
    res.json({
      success: result.success,
      message: result.message,
      details: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// Send test email
router.post('/send-test', async (req, res) => {
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

module.exports = router; 