const cron = require('node-cron');
const SyncSettings = require('../models/SyncSettings');
const syncService = require('../services/syncService');
const inactivityService = require('../services/inactivityService');
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');

let cronJob = null;
let inactivityCheckJob = null;

const initializeSyncJob = async () => {
    try {
        console.log('Initializing sync cron job...');
        const settings = await SyncSettings.findOne({});
        if (settings && settings.isEnabled) {
            startSyncJob(settings);
            startInactivityCheckJob();
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

const startInactivityCheckJob = () => {
    if (inactivityCheckJob) {
        inactivityCheckJob.stop();
    }

    // Run inactivity check every day at 10 AM
    console.log('Starting inactivity check job');
    inactivityCheckJob = cron.schedule('0 10 * * *', async () => {
        console.log('Running daily inactivity check...');
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
            
            // Process inactivity
            await inactivityService.processInactivityForAllStudents(studentsData);
            console.log('Inactivity check completed');
        } catch (error) {
            console.error('Error in inactivity check:', error);
        }
    });
};

const restartSyncJob = (settings) => {
    console.log('Restarting sync job...');
    startSyncJob(settings);
    startInactivityCheckJob();
};

module.exports = {
    initializeSyncJob,
    startSyncJob,
    restartSyncJob,
    startInactivityCheckJob
};