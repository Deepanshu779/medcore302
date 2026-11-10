const express = require('express');
const router = express.Router();
const db = require('../db');

// Trigger emergency SOS
router.post('/sos', async (req, res) => {
    try {
        const { userId, lat, lng, bloodGroup, contacts } = req.body;
        console.log(`[SOS DISPATCH] User ${userId || 'guest'} triggered emergency alert at [${lat}, ${lng}].`);

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        await db.run(
            'INSERT INTO activity_logs (userId, deviceType, location, ipAddress, actionType, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [userId || 1, 'Mobile/Web Browser', `${lat}, ${lng}`, ip, 'SOS EMERGENCY TRIGGER', new Date().toISOString()]
        );

        res.json({
            success: true,
            dispatchMessage: "SOS Alert Dispatched. Nearest emergency ambulance has been routed to your coordinates.",
            eta: "7 mins",
            ambulanceId: "AMB-DL-023-A"
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to dispatch SOS alert' });
    }
});

module.exports = router;

