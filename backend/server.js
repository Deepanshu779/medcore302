const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./src/config');
const db = require('./src/db');

// Route modules
const authRoutes = require('./src/routes/auth.routes');
const doctorsRoutes = require('./src/routes/doctors.routes');
const appointmentsRoutes = require('./src/routes/appointments.routes');
const hospitalsRoutes = require('./src/routes/hospitals.routes');
const healthRoutes = require('./src/routes/health.routes');
const emergencyRoutes = require('./src/routes/emergency.routes');
const bloodRoutes = require('./src/routes/blood.routes');
const labRoutes = require('./src/routes/lab.routes');
const vaultRoutes = require('./src/routes/vault.routes');
const prescriptionsRoutes = require('./src/routes/prescriptions.routes');
const activityRoutes = require('./src/routes/activity.routes');
const familyRoutes = require('./src/routes/family.routes');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static frontend serving
const distPath = path.resolve(__dirname, '../frontend/dist');
const rawPath = path.resolve(__dirname, '../frontend');
app.use(express.static(fs.existsSync(distPath) ? distPath : rawPath));
app.use('/src', express.static(path.resolve(__dirname, '../frontend/src')));
app.use(express.static(rawPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'medcore-backend', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', authRoutes); // supports PUT /api/profile/:id

app.use('/api/doctors', doctorsRoutes);
app.use('/api/doctors/prescription', prescriptionsRoutes);
app.use('/api/doctors/prescriptions', prescriptionsRoutes);

app.use('/api/appointments', appointmentsRoutes);
app.get('/api/all-appointments', (req, res, next) => {
    req.url = '/all/system';
    appointmentsRoutes(req, res, next);
});

app.use('/api/hospitals', hospitalsRoutes);

// Health & Clinical Triage Endpoints
app.use('/api', healthRoutes); // /api/predict-disease, /api/health-score
app.use('/api/ai', healthRoutes); // /api/ai/scan-report, /api/ai/check-interactions

app.use('/api/emergency', emergencyRoutes);
app.use('/api/blood-network', bloodRoutes);
app.use('/api/lab-test', labRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/family-profiles', familyRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Ensure database is initialized before listening
db.getDb();

if (process.env.NODE_ENV !== 'test') {
    app.listen(config.PORT, () => {
        console.log(`[MedCore Server] Running at http://localhost:${config.PORT}`);
    });
}

module.exports = app;
