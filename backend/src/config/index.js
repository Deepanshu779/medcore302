const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_PATH: process.env.DATABASE_URL || process.env.DB_PATH || path.resolve(__dirname, '../../medcore.sqlite'),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB limit for medical document uploads
};

