const mongoose = require('mongoose');

const syncSettingsSchema = new mongoose.Schema({
  cronTime: {
    type: String,
    default: '0 2 * * *' // Default: 2 AM daily
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  lastGlobalSync: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SyncSettings', syncSettingsSchema); 