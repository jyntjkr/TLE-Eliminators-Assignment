// routes/codeforcesRoutes.js
const express = require('express');
const router = express.Router();
const { updateCronSchedule, getCronSchedule } = require('../controllers/cronController');
const { fetchCodeforcesData } = require('../controllers/codeforcesController');
const Student = require('../models/Student');


// Manual Sync for a specific user
router.post('/sync/:handle', async (req, res) => {
    try {
        const handle = req.params.handle;
        const student = await Student.findOne({ codeforcesHandle: handle });
        if (!student) {
            return res.status(404).send({ message: 'Student not found.' });
        }
        await fetchCodeforcesData(handle);
        res.send({ message: `Data for ${handle} synced successfully.` });
    } catch (error) {
        res.status(500).send({ message: 'Error syncing data.', error: error.message });
    }
});


// Get current cron schedule
router.get('/cron', (req, res) => {
    res.send({ schedule: getCronSchedule() });
});

// Update cron schedule
router.post('/cron', (req, res) => {
    const { schedule } = req.body;
    if (updateCronSchedule(schedule)) {
        res.send({ message: `Cron schedule updated to '${schedule}'.` });
    } else {
        res.status(400).send({ message: 'Invalid cron schedule format.' });
    }
});

module.exports = router;