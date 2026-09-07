const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { authenticateToken, requireRole } = require('./middleware/authMiddleware');
const authCtrl = require('./controllers/authController');
const issueCtrl = require('./controllers/issueController');
const mlCtrl = require('./controllers/mlController');
const testCtrl = require('./controllers/testController');
const { initDb } = require('./db/index');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
// Auth
app.post('/api/auth/register', authCtrl.register);
app.post('/api/auth/login', authCtrl.login);
app.get('/api/auth/me', authenticateToken, authCtrl.getMe);
app.put('/api/users/me', authenticateToken, authCtrl.updateProfile);

// Issues
app.post('/api/issues', authenticateToken, requireRole('USER'), issueCtrl.createIssue);
app.get('/api/issues/my', authenticateToken, requireRole('USER'), issueCtrl.getMyReportedIssues);
app.get('/api/issues/available', authenticateToken, requireRole('TECH_MEMBER'), issueCtrl.getAvailableIssues);
app.get('/api/issues/assigned', authenticateToken, requireRole('TECH_MEMBER'), issueCtrl.getMyAssignedIssues);

app.get('/api/issues/stats', authenticateToken, issueCtrl.getStats);
app.get('/api/issues/:id', authenticateToken, issueCtrl.getIssueById);

app.post('/api/issues/:id/take', authenticateToken, requireRole('TECH_MEMBER'), issueCtrl.takeIssue);
app.patch('/api/issues/:id/resolve', authenticateToken, requireRole('TECH_MEMBER'), issueCtrl.resolveIssue);

// Comments
app.get('/api/issues/:id/comments', authenticateToken, issueCtrl.getComments);
app.post('/api/issues/:id/comments', authenticateToken, issueCtrl.addComment);

// ML
app.post('/api/ml/predict', authenticateToken, requireRole('USER'), mlCtrl.predictIssue);

// Dev Tools
app.get('/api/test/error-500', testCtrl.test500);
app.get('/api/test/slow', testCtrl.testSlow);
app.get('/api/test/db-error', testCtrl.testDbError);
app.get('/api/test/invalid-data', testCtrl.testInvalidData);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database', err);
});
