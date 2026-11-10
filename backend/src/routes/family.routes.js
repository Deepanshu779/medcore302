const express = require('express');
const router = express.Router();
const db = require('../db');

// Create family profile
router.post('/', async (req, res) => {
    try {
        const { userId, relationship, name, age, bloodGroup, allergies } = req.body;
        if (!userId || !name || !relationship) {
            return res.status(400).json({ error: 'User ID, relationship, and name are required' });
        }

        const result = await db.run(
            'INSERT INTO family_profiles (userId, relationship, name, age, bloodGroup, allergies) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, relationship, name, age || null, bloodGroup || '', allergies || '']
        );

        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to save family profile' });
    }
});

// Get family profiles for a user
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all('SELECT * FROM family_profiles WHERE userId = ? ORDER BY id DESC', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve family profiles' });
    }
});

module.exports = router;

