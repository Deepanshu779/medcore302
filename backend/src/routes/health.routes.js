const express = require('express');
const router = express.Router();
const healthService = require('../services/health.service');

// Disease triage prediction
router.post('/predict-disease', (req, res) => {
    try {
        const result = healthService.predictDisease(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Disease prediction failed' });
    }
});

// Health score calculation
router.post('/health-score', (req, res) => {
    try {
        const result = healthService.calculateHealthScore(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Health score calculation failed' });
    }
});

// Diagnostic report scanner
router.post('/scan-report', (req, res) => {
    try {
        const result = healthService.scanReport(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Report scan failed' });
    }
});

// Drug interaction checker
router.post('/check-interactions', (req, res) => {
    try {
        const { medicines } = req.body;
        const result = healthService.checkDrugInteractions(medicines || []);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Drug interaction check failed' });
    }
});

module.exports = router;

