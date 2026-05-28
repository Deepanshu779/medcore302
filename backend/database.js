const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'medcore.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite Database');
        
        // Define Tables
        db.serialize(() => {
            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                lastName TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                password TEXT
            )`);
            
            // Appointments Table
            db.run(`CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                docName TEXT,
                date TEXT,
                time TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`);

            // Prescriptions Table
            db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                docName TEXT,
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
                userId INTEGER,
                fileName TEXT,
                fileType TEXT,
                fileData TEXT,
                uploadedAt TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`);

            // Activity Logs Table
            db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
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
                userId INTEGER,
                relationship TEXT,
                name TEXT,
                age INTEGER,
                bloodGroup TEXT,
                allergies TEXT,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`);

            // Blood Donors Table
            db.run(`CREATE TABLE IF NOT EXISTS blood_donors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                name TEXT,
                bloodGroup TEXT,
                city TEXT,
                phone TEXT,
                available INTEGER DEFAULT 1,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`);

            // Lab Bookings Table
            db.run(`CREATE TABLE IF NOT EXISTS lab_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                testName TEXT,
                scheduleDate TEXT,
                address TEXT,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY (userId) REFERENCES users (id)
            )`);

            // Seed initial mock blood donors if table is empty
            db.get('SELECT COUNT(*) AS count FROM blood_donors', (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare('INSERT INTO blood_donors (name, bloodGroup, city, phone, available) VALUES (?, ?, ?, ?, ?)');
                    stmt.run(['Aarav Sharma', 'O+', 'Delhi', '+91-9876543210', 1]);
                    stmt.run(['Diya Patel', 'AB-', 'Noida', '+91-9988776655', 1]);
                    stmt.run(['Rohan Kapoor', 'B+', 'Gurugram', '+91-9555123456', 1]);
                    stmt.run(['Ananya Sen', 'A-', 'Delhi', '+91-9333888777', 0]);
                    stmt.finalize();
                    console.log('Seeded initial blood donors registry.');
                }
            });

            console.log('Tables created or verified.');
        });
    }
});

module.exports = db;

