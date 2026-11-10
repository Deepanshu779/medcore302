const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

// Upload a document into the medical vault
router.post('/upload', async (req, res) => {
    try {
        const { userId, fileName, fileType, fileData } = req.body;
        if (!userId || !fileName || !fileData) {
            return res.status(400).json({ error: 'User ID, file name, and file data are required' });
        }

        // Basic payload size safety check
        if (typeof fileData === 'string' && fileData.length > config.MAX_FILE_SIZE * 1.37) { // 10MB base64 overhead
            return res.status(413).json({ error: 'File size exceeds maximum allowable limit (10MB)' });
        }

        const result = await db.run(
            'INSERT INTO medical_vault (userId, fileName, fileType, fileData, uploadedAt) VALUES (?, ?, ?, ?, ?)',
            [userId, fileName, fileType || 'application/octet-stream', fileData, new Date().toISOString()]
        );

        res.status(201).json({
            id: result.lastID,
            success: true,
            fileName,
            fileType
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to upload vault file' });
    }
});

// List documents in user's medical vault (excludes raw fileData to preserve bandwidth)
router.get('/files/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const rows = await db.all(
            'SELECT id, fileName, fileType, uploadedAt FROM medical_vault WHERE userId = ? ORDER BY id DESC',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to retrieve vault files' });
    }
});

module.exports = router;

