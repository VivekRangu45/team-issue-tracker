const { db } = require('../db/index');

const createIssue = (req, res) => {
    const { title, description, category, priority } = req.body;
    
    if (!title || !description || !category || !priority) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    db.run(
        `INSERT INTO issues (title, description, category, priority, status, reported_by) VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
        [title, description, category, priority, req.user.userId],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: 'Server error', error: err.message });
            res.status(201).json({ success: true, data: { id: this.lastID } });
        }
    );
};

const getIssueById = (req, res) => {
    const id = req.params.id;
    db.get(
        `SELECT i.*, u1.name as reporter_name, u2.name as assignee_name 
         FROM issues i 
         JOIN users u1 ON i.reported_by = u1.id 
         LEFT JOIN users u2 ON i.assigned_to = u2.id 
         WHERE i.id = ?`,
        [id],
        (err, issue) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
            
            // Authorization check
            if (req.user.role === 'USER' && issue.reported_by !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
            // Tech members can view any active issue, or issues assigned to them.
            // Simplified: allow tech member to view any issue details to decide if they want it.
            
            res.json({ success: true, data: issue });
        }
    );
};

const getMyReportedIssues = (req, res) => {
    db.all(
        `SELECT i.*, u.name as assignee_name FROM issues i 
         LEFT JOIN users u ON i.assigned_to = u.id
         WHERE i.reported_by = ? ORDER BY i.created_at DESC`,
        [req.user.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            res.json({ success: true, data: rows });
        }
    );
};

const getAvailableIssues = (req, res) => {
    // Only ACTIVE issues, no assignee
    db.all(
        `SELECT i.*, u.name as reporter_name FROM issues i 
         JOIN users u ON i.reported_by = u.id
         WHERE i.status = 'ACTIVE' AND i.assigned_to IS NULL 
         ORDER BY i.created_at DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            res.json({ success: true, data: rows });
        }
    );
};

const getMyAssignedIssues = (req, res) => {
    db.all(
        `SELECT i.*, u.name as reporter_name FROM issues i 
         JOIN users u ON i.reported_by = u.id
         WHERE i.assigned_to = ? ORDER BY i.created_at DESC`,
        [req.user.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            res.json({ success: true, data: rows });
        }
    );
};

const takeIssue = (req, res) => {
    const id = req.params.id;
    // Atomic update
    db.run(
        `UPDATE issues SET assigned_to = ?, status = 'WORKING', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND status = 'ACTIVE' AND assigned_to IS NULL`,
        [req.user.userId, id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            if (this.changes === 0) {
                return res.status(409).json({ success: false, message: 'Issue is no longer available' });
            }
            res.json({ success: true, message: 'Issue taken successfully' });
        }
    );
};

const resolveIssue = (req, res) => {
    const id = req.params.id;
    // Only assigned tech member can resolve
    db.run(
        `UPDATE issues SET status = 'RESOLVED', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND assigned_to = ? AND status = 'WORKING'`,
        [id, req.user.userId],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            if (this.changes === 0) {
                return res.status(403).json({ success: false, message: 'Not authorized or issue not in WORKING state' });
            }
            res.json({ success: true, message: 'Issue resolved successfully' });
        }
    );
};

// Comments
const getComments = (req, res) => {
    const issueId = req.params.id;
    db.all(
        `SELECT c.*, u.name as user_name, u.role as user_role 
         FROM comments c JOIN users u ON c.user_id = u.id 
         WHERE c.issue_id = ? ORDER BY c.created_at ASC`,
        [issueId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error' });
            res.json({ success: true, data: rows });
        }
    );
};

const addComment = (req, res) => {
    const issueId = req.params.id;
    const { comment } = req.body;

    if (!comment) return res.status(400).json({ success: false, message: 'Comment required' });

    // Verify auth logic for comment
    db.get(`SELECT reported_by, assigned_to FROM issues WHERE id = ?`, [issueId], (err, issue) => {
        if (err || !issue) return res.status(404).json({ success: false, message: 'Issue not found' });

        if (req.user.role === 'USER' && issue.reported_by !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        if (req.user.role === 'TECH_MEMBER' && issue.assigned_to !== req.user.userId) {
            // Technically a tech member can view ACTIVE issues but probably shouldn't comment unless they've taken it,
            // or maybe they can. Let's restrict to assigned or allow if they want. Let's keep it simple: must be assigned.
            if(issue.assigned_to !== req.user.userId) {
                return res.status(403).json({ success: false, message: 'Must take issue before commenting' });
            }
        }

        db.run(
            `INSERT INTO comments (issue_id, user_id, comment) VALUES (?, ?, ?)`,
            [issueId, req.user.userId, comment],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: 'Server error' });
                res.status(201).json({ success: true, data: { id: this.lastID } });
            }
        );
    });
};

const getStats = (req, res) => {
    const role = req.user.role;
    const userId = req.user.userId;

    if (role === 'USER') {
        db.all(`SELECT status, COUNT(*) as count FROM issues WHERE reported_by = ? GROUP BY status`, [userId], (err, rows) => {
            if (err) return res.status(500).json({ success: false });
            let stats = { total: 0, ACTIVE: 0, WORKING: 0, RESOLVED: 0 };
            rows.forEach(r => {
                stats[r.status] = r.count;
                stats.total += r.count;
            });
            res.json({ success: true, data: stats });
        });
    } else {
        db.serialize(() => {
            let stats = { available: 0, WORKING: 0, RESOLVED: 0 };
            db.get(`SELECT COUNT(*) as count FROM issues WHERE status = 'ACTIVE' AND assigned_to IS NULL`, (err, row) => {
                if(row) stats.available = row.count;
            });
            db.all(`SELECT status, COUNT(*) as count FROM issues WHERE assigned_to = ? GROUP BY status`, [userId], (err, rows) => {
                if (rows) {
                    rows.forEach(r => {
                        stats[r.status] = r.count;
                    });
                }
                res.json({ success: true, data: stats });
            });
        });
    }
};

module.exports = {
    createIssue, getIssueById, getMyReportedIssues, getAvailableIssues, getMyAssignedIssues,
    takeIssue, resolveIssue, getComments, addComment, getStats
};
