const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configure based on your email provider
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendInactivityReminder(student, inactiveDays) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: student.email,
        subject: '🚀 Time to Get Back to Problem Solving!',
        html: this.generateInactivityEmailTemplate(student, inactiveDays)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Inactivity reminder sent to ${student.email}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`Failed to send reminder to ${student.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  generateInactivityEmailTemplate(student, inactiveDays) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .stats { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Hey ${student.name}!</h1>
            <p>Your coding journey is waiting for you</p>
          </div>
          <div class="content">
            <p>We noticed you haven't made any submissions on Codeforces in the last <strong>${inactiveDays} days</strong>. Don't let your problem-solving skills get rusty! 💪</p>
            
            <div class="stats">
              <h3>📊 Your Current Stats:</h3>
              <p><strong>Handle:</strong> ${student.codeforcesHandle}</p>
              <p><strong>Current Rating:</strong> ${student.currentRating || 'Unrated'}</p>
              <p><strong>Max Rating:</strong> ${student.maxRating || 'Unrated'}</p>
            </div>
            
            <p>Remember, consistency is key to improvement in competitive programming. Even solving one problem a day can make a significant difference!</p>
            
            <div style="text-align: center;">
              <a href="https://codeforces.com/problemset" class="cta-button">🎯 Start Solving Problems</a>
            </div>
            
            <p><strong>💡 Quick Tips to Get Back on Track:</strong></p>
            <ul>
              <li>Start with easier problems to build momentum</li>
              <li>Set a daily goal (even 15 minutes counts!)</li>
              <li>Focus on topics you find challenging</li>
              <li>Join virtual contests to practice</li>
            </ul>
            
            <p>You've got this! Every expert was once a beginner. 🌟</p>
          </div>
          <div class="footer">
            <p>Happy Coding! 💻<br>
            Student Management System</p>
            <p><small>If you don't want to receive these reminders, please contact your administrator.</small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error.message);
      return false;
    }
  }

  // Add this method to your EmailService class
  async getEmailConfiguration() {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      user: process.env.EMAIL_USER,
      // Don't return the actual password for security
      hasPassword: !!process.env.EMAIL_PASSWORD,
      connectionActive: await this.testConnection()
    };
  }

  // Add this method to your EmailService class
  async testConnectionWithDetails() {
    try {
      const result = await this.transporter.verify();
      return {
        success: true,
        message: 'SMTP connection successful'
      };
    } catch (error) {
      console.error('SMTP connection error:', error);
      return {
        success: false,
        message: 'SMTP connection failed',
        error: {
          code: error.code,
          command: error.command,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            // Never log the actual password
            pass: process.env.EMAIL_PASSWORD ? '********' : undefined
          }
        }
      };
    }
  }
}

module.exports = new EmailService();
