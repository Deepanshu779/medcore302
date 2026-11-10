const express = require('express');
const router = express.Router();
const db = require('../db');

// Create prescription
router.post('/', async (req, res) => {
    try {
        const { userId, docName, docSpecialty, drugs, signature, qrText } = req.body;
        if (!userId || !docName) {
            return res.status(400).json({ error: 'User ID and doctor name are required' });
        }

        const dateStr = new Date().toLocaleDateString('en-IN');
        const drugsJson = JSON.stringify(drugs || []);

        const result = await db.run(
            'INSERT INTO prescriptions (userId, docName, docSpecialty, drugs, signature, qrText, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, docName, docSpecialty || '', drugsJson, signature || '', qrText || '', dateStr]
        );

        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to generate prescription' });
    }
});

// Get user prescriptions
router.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all('SELECT * FROM prescriptions WHERE userId = ? ORDER BY id DESC', [userId]);

        const parsedRows = rows.map(r => {
            let parsedDrugs = [];
            try {
                parsedDrugs = JSON.parse(r.drugs || '[]');
            } catch (e) {
                parsedDrugs = [];
            }
            return {
                ...r,
                drugs: parsedDrugs
            };
        });

        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve prescriptions' });
    }
});

module.exports = router;

