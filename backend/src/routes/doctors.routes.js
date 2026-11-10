const express = require('express');
const router = express.Router();
const doctors = require('../data/doctors.json');

// Get all doctors
router.get('/', (req, res) => {
    res.json(doctors);
});

module.exports = router;

