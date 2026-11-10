const express = require('express');
const router = express.Router();
const hospitals = require('../data/hospitals.json');

// Get all hospital hubs
router.get('/', (req, res) => {
    res.json(hospitals);
});

module.exports = router;

