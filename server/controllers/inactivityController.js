const Student = require('../models/Student');
const EmailReminder = require('../models/EmailReminder');
const inactivityService = require('../services/inactivityService');

const inactivityController = {
  // Toggle email reminders for a student
  async toggleEmailReminders(req, res) {
    try {
      const { id } = req.params;
      const { enabled } = req.body;

      const student = await Student.findByIdAndUpdate(
        id,
        { emailRemindersEnabled: enabled },
        { new: true }
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      res.json({
        success: true,
        data: student,
        message: `Email reminders ${enabled ? 'enabled' : 'disabled'} for ${student.name}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating email reminder settings',
        error: error.message
      });
    }
  },

  // Get reminder history for a student
  async getReminderHistory(req, res) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 10;
      
      const history = await inactivityService.getStudentReminderHistory(id, limit);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching reminder history',
        error: error.message
      });
    }
  },

  // Get inactivity statistics
  async getInactivityStats(req, res) {
    try {
      const stats = await inactivityService.getInactivityStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inactivity statistics',
        error: error.message
      });
    }
  },

  // Get inactive students list
  async getInactiveStudents(req, res) {
    try {
      const inactiveStudents = await Student.find({ isInactive: true })
        .select('name email codeforcesHandle lastSubmissionDate inactivityDetectedAt totalRemindersSent emailRemindersEnabled')
        .sort({ inactivityDetectedAt: -1 });

      res.json({
        success: true,
        data: inactiveStudents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching inactive students',
        error: error.message
      });
    }
  },

  // Send a test reminder to a student
  async sendTestReminder(req, res) {
    try {
      const { studentId } = req.params;
      const student = await Student.findById(studentId);
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      if (!student.email) {
        return res.status(400).json({
          success: false,
          message: 'Student has no email address'
        });
      }
      
      const result = await inactivityService.handleInactivityReminder(student, 7);
      
      res.json({
        success: true,
        data: result,
        message: result.sent ? 
          'Test reminder sent successfully' : 
          'Failed to send test reminder'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending test reminder',
        error: error.message
      });
    }
  }
};

module.exports = inactivityController;