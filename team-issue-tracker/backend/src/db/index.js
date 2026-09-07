const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use environment variable for the database path, with a fallback for local development
const dbPathRaw = process.env.DATABASE_PATH || './database/database.sqlite';
const dbPath = path.isAbsolute(dbPathRaw) ? dbPathRaw : path.resolve(process.cwd(), dbPathRaw);

// Ensure the directory for the database exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Setup tables
const initDb = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // USERS table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('USER', 'TECH_MEMBER')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => { if(err) console.error(err); });

            // ISSUES table
            db.run(`CREATE TABLE IF NOT EXISTS issues (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL CHECK(category IN ('BUG', 'FEATURE', 'DOCUMENTATION', 'SECURITY', 'PERFORMANCE', 'UI', 'OTHER')),
                priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'WORKING', 'RESOLVED')),
                reported_by INTEGER NOT NULL,
                assigned_to INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(reported_by) REFERENCES users(id),
                FOREIGN KEY(assigned_to) REFERENCES users(id)
            )`, (err) => { if(err) console.error(err); });

            // COMMENTS table
            db.run(`CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                issue_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                comment TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(issue_id) REFERENCES issues(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`, (err) => { if(err) console.error(err); });

            // Indexes
            db.run(`CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON issues(reported_by)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to)`);
            
            resolve();
        });
    });
};

module.exports = { db, initDb };
