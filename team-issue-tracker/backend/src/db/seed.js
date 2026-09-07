require('dotenv').config();
const { db, initDb } = require('./index');
const bcrypt = require('bcrypt');

const seedData = async () => {
    await initDb();
    
    console.log("Seeding database...");

    const insertOrGetUser = (name, email, password, role) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
                if (err) return reject(err);
                if (row) {
                    console.log(`User ${email} already exists.`);
                    return resolve(row.id);
                }
                
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) return reject(err);
                    db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
                        [name, email, hash, role], 
                        function(err) {
                            if (err) reject(err);
                            else resolve(this.lastID);
                        });
                });
            });
        });
    };

    const insertIssue = (title, desc, cat, pri, status, reported_by, assigned_to = null) => {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO issues (title, description, category, priority, status, reported_by, assigned_to) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [title, desc, cat, pri, status, reported_by, assigned_to],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    };

    try {
        // Insert Users safely
        const userId = await insertOrGetUser("Demo User", "user@example.com", "User@123", "USER");
        const techId = await insertOrGetUser("Demo Tech", "tech@example.com", "Tech@123", "TECH_MEMBER");

        console.log(`Demo User ID: ${userId}, Demo Tech ID: ${techId}`);

        // Check if issues already exist to prevent duplicate seeding
        db.get(`SELECT COUNT(*) as count FROM issues`, async (err, row) => {
            if (err) throw err;
            if (row && row.count > 0) {
                console.log("Issues already exist in database. Skipping issue seeding.");
            } else {
                // Insert Demo Issues
                await insertIssue(
                    "Login page crashes after logout", 
                    "When I logout and try to login again immediately, the app shows a white screen.", 
                    "BUG", "HIGH", "WORKING", userId, techId
                );

                await insertIssue(
                    "Add dark mode to dashboard", 
                    "Users have requested a dark mode setting in their profile.", 
                    "FEATURE", "MEDIUM", "ACTIVE", userId, null
                );

                await insertIssue(
                    "Payment endpoint returns 500", 
                    "Customers are reporting a 500 internal server error during checkout.", 
                    "BUG", "CRITICAL", "ACTIVE", userId, null
                );

                await insertIssue(
                    "Dashboard takes 10 seconds to load", 
                    "The initial data fetch on the dashboard is very slow.", 
                    "PERFORMANCE", "HIGH", "RESOLVED", userId, techId
                );

                await insertIssue(
                    "Update installation documentation", 
                    "The README is missing instructions for Docker.", 
                    "DOCUMENTATION", "LOW", "RESOLVED", userId, techId
                );

                console.log("Demo issues seeded successfully.");
            }
            console.log("Database seeded successfully.");
            setTimeout(() => db.close(), 1000);
        });

    } catch (error) {
        console.error("Error seeding data:", error);
        setTimeout(() => db.close(), 1000);
    }
};

seedData();
