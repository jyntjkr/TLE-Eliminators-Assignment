const mongoose = require('mongoose');

const emailReminderSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  emailType: {
    type: String,
    enum: ['inactivity_reminder'],
    default: 'inactivity_reminder'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  inactiveDays: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

emailReminderSchema.index({ studentId: 1, sentAt: -1 });

module.exports = mongoose.model('EmailReminder', emailReminderSchema);
