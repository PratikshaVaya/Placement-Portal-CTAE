const router = require('express').Router();
const { analyzeResume, getHistory } = require('../controllers/aiResumeController');
const { authenticateUser } = require('../middleware/authentication-middleware');

// POST /api/v1/ai-resume/analyze
// Protected — student must be logged in
router.post('/analyze', authenticateUser, analyzeResume);

// GET /api/v1/ai-resume/history
router.get('/history', authenticateUser, getHistory);

module.exports = router;
