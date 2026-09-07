const { db } = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!['USER', 'TECH_MEMBER'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
            [name, email, hash, role], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(409).json({ success: false, message: 'Email already exists' });
                    }
                    return res.status(500).json({ success: false, message: 'Server error' });
                }
                res.status(201).json({ success: true, data: { id: this.lastID, name, email, role } });
            });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1d' }
        );

        res.json({ 
            success: true, 
            data: { 
                token, 
                user: { id: user.id, name: user.name, email: user.email, role: user.role } 
            } 
        });
    });
};

const getMe = (req, res) => {
    db.get(`SELECT id, name, email, role, created_at FROM users WHERE id = ?`, [req.user.userId], (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    });
};

const updateProfile = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    db.run(`UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [name, req.user.userId], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        res.json({ success: true, data: { id: req.user.userId, name } });
    });
};

module.exports = { register, login, getMe, updateProfile };
