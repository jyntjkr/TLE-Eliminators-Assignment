const cron = require('node-cron');
const SyncSettings = require('../models/SyncSettings');
const syncService = require('../services/syncService');

let cronJob = null;

const initializeSyncJob = async () => {
    try {
        console.log('Initializing sync cron job...');
        const settings = await SyncSettings.findOne({});
        if (settings && settings.isEnabled) {
            startSyncJob(settings);
        }
    } catch (error) {
        console.error('Error initializing sync job:', error);
    }
};

const startSyncJob = (settings) => {
    if (cronJob) {
        cronJob.stop();
    }

    console.log(`Starting sync job with schedule: ${settings.cronTime}`);
    cronJob = cron.schedule(settings.cronTime, async () => {
        console.log('Running scheduled sync...');
        try {
            await syncService.syncAllStudents();
            console.log('Scheduled sync completed successfully');
        } catch (error) {
            console.error('Error in scheduled sync:', error);
        }
    });
};

const restartSyncJob = (settings) => {
    console.log('Restarting sync job...');
    startSyncJob(settings);
};

module.exports = {
    initializeSyncJob,
    startSyncJob,
    restartSyncJob
}; 