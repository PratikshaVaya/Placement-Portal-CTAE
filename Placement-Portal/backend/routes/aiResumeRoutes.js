const router = require('express').Router();
const { analyzeResume, getHistory } = require('../controllers/aiResumeController');
const { authenticateUser, authorizeRoles } = require('../middleware/authentication-middleware');

// POST /api/v1/ai-resume/analyze
// Protected — student must be logged in
router.post('/analyze', [authenticateUser, authorizeRoles('student')], analyzeResume);

// GET /api/v1/ai-resume/history
router.get('/history', [authenticateUser, authorizeRoles('student')], getHistory);

module.exports = router;
