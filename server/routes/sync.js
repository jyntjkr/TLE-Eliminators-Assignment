const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

router.get('/settings', syncController.getSyncSettings);
router.put('/settings', syncController.updateSyncSettings);
router.post('/trigger', syncController.triggerGlobalSync);

module.exports = router; 