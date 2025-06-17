const SyncSettings = require('../models/SyncSettings');
const syncService = require('../services/syncService');
const cronJobs = require('../utils/cronJobs');

const syncController = {
  // Get sync settings
  async getSyncSettings(req, res) {
    try {
      let settings = await SyncSettings.findOne({});
      if (!settings) {
        settings = new SyncSettings();
        await settings.save();
      }
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sync settings',
        error: error.message
      });
    }
  },

  // Update sync settings
  async updateSyncSettings(req, res) {
    try {
      const { cronTime, frequency, isEnabled } = req.body;

      let settings = await SyncSettings.findOne({});
      if (!settings) {
        settings = new SyncSettings();
      }

      settings.cronTime = cronTime || settings.cronTime;
      settings.frequency = frequency || settings.frequency;
      settings.isEnabled = isEnabled !== undefined ? isEnabled : settings.isEnabled;

      await settings.save();

      // Restart cron job with new settings
      cronJobs.restartSyncJob(settings);

      res.json({
        success: true,
        data: settings,
        message: 'Sync settings updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating sync settings',
        error: error.message
      });
    }
  },

  // Manually trigger global sync
  async triggerGlobalSync(req, res) {
    try {
      const results = await syncService.syncAllStudents();
      
      res.json({
        success: true,
        message: 'Global sync completed',
        data: results
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during global sync',
        error: error.message
      });
    }
  }
};

module.exports = syncController; 