const express = require('express');
const router = express.Router();
const db = require('../db');

// Create appointment
router.post('/', async (req, res) => {
    try {
        const { userId, docName, date, time } = req.body;
        if (!userId || !docName || !date || !time) {
            return res.status(400).json({ error: 'User ID, doctor name, date, and time are required' });
        }

        const result = await db.run(
            'INSERT INTO appointments (userId, docName, date, time) VALUES (?, ?, ?, ?)',
            [userId, docName, date, time]
        );

        res.status(201).json({
            id: result.lastID,
            userId,
            docName,
            date,
            time
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to book appointment' });
    }
});

// Get appointments for a user
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all('SELECT * FROM appointments WHERE userId = ? ORDER BY id DESC', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve appointments' });
    }
});

// Get all appointments (across system for calendar availability)
router.get('/all/system', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM appointments ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve system appointments' });
    }
});

module.exports = router;

