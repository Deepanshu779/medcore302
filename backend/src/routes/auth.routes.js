const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, verifyPassword } = require('../services/password.service');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        if (!firstName || !email || !password) {
            return res.status(400).json({ error: 'First name, email, and password are required' });
        }

        const hashedPassword = await hashPassword(password);
        const result = await db.run(
            'INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)',
            [firstName.trim(), lastName ? lastName.trim() : '', email.trim().toLowerCase(), phone ? phone.trim() : '', hashedPassword]
        );

        res.status(201).json({
            id: result.lastID,
            firstName: firstName.trim(),
            lastName: lastName ? lastName.trim() : '',
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : ''
        });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        res.status(500).json({ error: err.message || 'Internal server error during registration' });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Internal server error during login' });
    }
});

// Update profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const userId = parseInt(req.params.id, 10);
        if (!userId) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        await db.run(
            'UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ? WHERE id = ?',
            [firstName, lastName, email, phone, userId]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
});

module.exports = router;

