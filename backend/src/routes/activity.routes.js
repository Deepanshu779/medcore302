const express = require('express');
const router = express.Router();
const db = require('../db');

// Record an activity/audit log
router.post('/', async (req, res) => {
    try {
        const { userId, deviceType, location, ipAddress, actionType } = req.body;
        const ip = ipAddress || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

        const result = await db.run(
            'INSERT INTO activity_logs (userId, deviceType, location, ipAddress, actionType, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [userId || 1, deviceType || 'Web Browser', location || 'Unknown', ip, actionType || 'GENERAL_ACTION', new Date().toISOString()]
        );

        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to record activity log' });
    }
});

// Retrieve latest activity logs for a user
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all(
            'SELECT * FROM activity_logs WHERE userId = ? ORDER BY id DESC LIMIT 20',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve activity logs' });
    }
});

module.exports = router;

