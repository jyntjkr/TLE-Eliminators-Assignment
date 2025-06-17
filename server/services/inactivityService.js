const Student = require('../models/Student');
const EmailReminder = require('../models/EmailReminder');
const emailService = require('./emailService');

class InactivityService {
  constructor() {
    this.INACTIVITY_THRESHOLD_DAYS = 7;
    this.MIN_REMINDER_INTERVAL_HOURS = 24; // Prevent spam
  }

  async checkInactivityForStudent(studentId, submissionsData) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Find the most recent submission
      const lastSubmission = this.findLastSubmission(submissionsData);
      const lastSubmissionDate = lastSubmission ? new Date(lastSubmission.creationTimeSeconds * 1000) : null;
      
      // Calculate inactivity
      const now = new Date();
      const inactiveDays = lastSubmissionDate ? 
        Math.floor((now - lastSubmissionDate) / (1000 * 60 * 60 * 24)) : 
        Infinity;

      const isInactive = inactiveDays >= this.INACTIVITY_THRESHOLD_DAYS;

      // Update student record
      const updateData = {
        lastSubmissionDate,
        isInactive,
        inactivityDetectedAt: isInactive && !student.isInactive ? now : student.inactivityDetectedAt
      };

      await Student.findByIdAndUpdate(studentId, updateData);

      // Check if we should send reminder
      if (isInactive && !student.disableEmail) {
        await this.handleInactivityReminder(student, inactiveDays);
      }

      return {
        studentId,
        isInactive,
        inactiveDays: isInactive ? inactiveDays : 0,
        lastSubmissionDate
      };

    } catch (error) {
      console.error(`Error checking inactivity for student ${studentId}:`, error.message);
      throw error;
    }
  }

  findLastSubmission(submissions) {
    if (!submissions || submissions.length === 0) return null;
    
    // Sort by creation time and get the most recent
    return submissions
      .filter(sub => sub.verdict === 'OK') // Only consider accepted submissions
      .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds)[0];
  }

  async handleInactivityReminder(student, inactiveDays) {
    try {
      // Check if we recently sent a reminder to avoid spam
      const recentReminder = await EmailReminder.findOne({
        studentId: student._id,
        sentAt: {
          $gte: new Date(Date.now() - this.MIN_REMINDER_INTERVAL_HOURS * 60 * 60 * 1000)
        }
      });

      if (recentReminder) {
        console.log(`Skipping reminder for ${student.name} - recently sent`);
        return { skipped: true, reason: 'Recently sent' };
      }

      // Create email reminder record
      const emailReminder = new EmailReminder({
        studentId: student._id,
        inactiveDays,
        status: 'pending'
      });

      // Send email
      const emailResult = await emailService.sendInactivityReminder(student, inactiveDays);

      // Update reminder record
      emailReminder.status = emailResult.success ? 'sent' : 'failed';
      emailReminder.errorMessage = emailResult.error || null;
      await emailReminder.save();

      // Update student's reminder count
      if (emailResult.success) {
        await Student.findByIdAndUpdate(student._id, {
          $inc: { reminderSentCount: 1 },
          lastReminderSent: new Date()
        });
      }

      return {
        sent: emailResult.success,
        error: emailResult.error,
        reminderId: emailReminder._id
      };

    } catch (error) {
      console.error(`Error sending reminder to ${student.name}:`, error.message);
      throw error;
    }
  }

  async processInactivityForAllStudents(studentsData) {
    try {
      console.log('Processing inactivity detection for all students...');
      
      const results = [];
      
      for (const { studentId, submissions } of studentsData) {
        try {
          const result = await this.checkInactivityForStudent(studentId, submissions);
          results.push(result);
          
          // Add small delay to prevent overwhelming the email service
          if (result.isInactive) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`Failed to process inactivity for student ${studentId}:`, error.message);
          results.push({
            studentId,
            error: error.message
          });
        }
      }

      const summary = this.generateInactivitySummary(results);
      console.log('Inactivity processing completed:', summary);
      
      return results;
    } catch (error) {
      console.error('Error processing inactivity for all students:', error.message);
      throw error;
    }
  }

  generateInactivitySummary(results) {
    const total = results.length;
    const inactive = results.filter(r => r.isInactive).length;
    const errors = results.filter(r => r.error).length;
    
    return {
      totalStudents: total,
      inactiveStudents: inactive,
      errors,
      successRate: ((total - errors) / total * 100).toFixed(1) + '%'
    };
  }

  async getStudentReminderHistory(studentId, limit = 10) {
    try {
      const reminders = await EmailReminder.find({ studentId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .populate('studentId', 'name email');

      return reminders;
    } catch (error) {
      console.error(`Error fetching reminder history for student ${studentId}:`, error.message);
      throw error;
    }
  }

  async getInactivityStats() {
    try {
      const totalStudents = await Student.countDocuments();
      const inactiveStudents = await Student.countDocuments({ isInactive: true });
      const studentsWithRemindersDisabled = await Student.countDocuments({ disableEmail: true });
      
      const totalRemindersSent = await EmailReminder.countDocuments({ status: 'sent' });
      const failedReminders = await EmailReminder.countDocuments({ status: 'failed' });

      return {
        totalStudents,
        inactiveStudents,
        activeStudents: totalStudents - inactiveStudents,
        studentsWithRemindersDisabled,
        totalRemindersSent,
        failedReminders,
        inactivityRate: ((inactiveStudents / totalStudents) * 100).toFixed(1) + '%'
      };
    } catch (error) {
      console.error('Error getting inactivity stats:', error.message);
      throw error;
    }
  }
}

module.exports = new InactivityService();
