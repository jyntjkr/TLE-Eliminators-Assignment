const cron = require('node-cron');
const Student = require('../models/Student');
const { fetchCodeforcesData } = require('./codeforcesController');
const { sendInactivityEmail } = require('../utils/email');

let cronJob;
let cronSchedule = '0 2 * * *'; // Default: 2 AM daily

const syncAllStudentData = async () => {
    console.log('Starting daily Codeforces data sync...');
    const students = await Student.find({});
    for (const student of students) {
        await fetchCodeforcesData(student.codeforcesHandle);
        await checkInactivity(student);
    }
    console.log('Daily sync completed.');
};

const checkInactivity = async (student) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = student.submissionHistory.some(sub => new Date(sub.creationTimeSeconds * 1000) > sevenDaysAgo);

    if (!recentSubmissions && !student.disableEmail) {
        await sendInactivityEmail(student);
        student.reminderSentCount += 1;
        await student.save();
    }
};


const startCronJob = () => {
    cronJob = cron.schedule(cronSchedule, syncAllStudentData);
};

const updateCronSchedule = (newSchedule) => {
    if (cron.validate(newSchedule)) {
        cronSchedule = newSchedule;
        if (cronJob) {
            cronJob.stop();
        }
        startCronJob();
        return true;
    }
    return false;
};

module.exports = { startCronJob, updateCronSchedule, getCronSchedule: () => cronSchedule };