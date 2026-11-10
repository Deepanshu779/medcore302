const express = require('express');
const router = express.Router();
const db = require('../db');

// List blood donors with optional city and group filters
router.get('/', async (req, res) => {
    try {
        const { city, group } = req.query;
        let query = 'SELECT * FROM blood_donors WHERE 1=1';
        const params = [];

        if (city) {
            query += ' AND city = ?';
            params.push(city);
        }
        if (group) {
            query += ' AND bloodGroup = ?';
            params.push(group);
        }

        const rows = await db.all(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve blood donors' });
    }
});

// Register as a blood donor
router.post('/register', async (req, res) => {
    try {
        const { userId, name, bloodGroup, city, phone } = req.body;
        if (!name || !bloodGroup || !city || !phone) {
            return res.status(400).json({ error: 'Name, blood group, city, and phone are required' });
        }

        const result = await db.run(
            'INSERT INTO blood_donors (userId, name, bloodGroup, city, phone, available) VALUES (?, ?, ?, ?, ?, 1)',
            [userId || null, name, bloodGroup, city, phone]
        );

        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to register blood donor' });
    }
});

module.exports = router;

