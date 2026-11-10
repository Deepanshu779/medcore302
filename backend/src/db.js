const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

let dbInstance = null;

function getDb() {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(config.DB_PATH, (err) => {
            if (err) {
                console.error('[Database] Failed to connect to SQLite:', err.message);
            } else {
                console.log(`[Database] Connected to SQLite database at ${config.DB_PATH}`);
                initSchema();
            }
        });
    }
    return dbInstance;
}

function initSchema() {
    const db = getDb();
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL
        )`);

        // Appointments Table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            docName TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Prescriptions Table
        db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            docName TEXT NOT NULL,
            docSpecialty TEXT,
            drugs TEXT,
            signature TEXT,
            qrText TEXT,
            createdAt TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Medical Vault Table
        db.run(`CREATE TABLE IF NOT EXISTS medical_vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            fileName TEXT NOT NULL,
            fileType TEXT,
            fileData TEXT,
            uploadedAt TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Activity Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            deviceType TEXT,
            location TEXT,
            ipAddress TEXT,
            actionType TEXT,
            timestamp TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Family Profiles Table
        db.run(`CREATE TABLE IF NOT EXISTS family_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            relationship TEXT,
            name TEXT NOT NULL,
            age INTEGER,
            bloodGroup TEXT,
            allergies TEXT,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Blood Donors Table
        db.run(`CREATE TABLE IF NOT EXISTS blood_donors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            name TEXT NOT NULL,
            bloodGroup TEXT NOT NULL,
            city TEXT NOT NULL,
            phone TEXT NOT NULL,
            available INTEGER DEFAULT 1,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Lab Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS lab_bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            testName TEXT NOT NULL,
            scheduleDate TEXT NOT NULL,
            address TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Seed initial blood donors if table is empty
        db.get('SELECT COUNT(*) AS count FROM blood_donors', (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare('INSERT INTO blood_donors (name, bloodGroup, city, phone, available) VALUES (?, ?, ?, ?, ?)');
                stmt.run(['Aarav Sharma', 'O+', 'Delhi', '+91-9876543210', 1]);
                stmt.run(['Diya Patel', 'AB-', 'Noida', '+91-9988776655', 1]);
                stmt.run(['Rohan Kapoor', 'B+', 'Gurugram', '+91-9555123456', 1]);
                stmt.run(['Ananya Sen', 'A-', 'Delhi', '+91-9333888777', 0]);
                stmt.finalize();
                console.log('[Database] Seeded initial blood donors registry.');
            }
        });

        console.log('[Database] Schema verified.');
    });
}

// Promisified query helpers
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        getDb().all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    getDb,
    run,
    get,
    all
};

