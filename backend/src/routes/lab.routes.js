const express = require('express');
const router = express.Router();
const db = require('../db');

// Book a home sample diagnostic test
router.post('/book', async (req, res) => {
    try {
        const { userId, testName, scheduleDate, address } = req.body;
        if (!userId || !testName || !scheduleDate || !address) {
            return res.status(400).json({ error: 'User ID, test name, date, and address are required' });
        }

        const result = await db.run(
            'INSERT INTO lab_bookings (userId, testName, scheduleDate, address, status) VALUES (?, ?, ?, ?, "Pending")',
            [userId, testName, scheduleDate, address]
        );

        res.status(201).json({
            id: result.lastID,
            success: true,
            testName,
            scheduleDate
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to book lab test' });
    }
});

// Get user's lab bookings
router.get('/bookings/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all('SELECT * FROM lab_bookings WHERE userId = ? ORDER BY id DESC', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve lab bookings' });
    }
});

module.exports = router;

