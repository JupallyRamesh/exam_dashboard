// backend/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// POST /api/submissions/submit
router.post('/submit', submissionController.submitExam);

// Admin: List all submissions needing grading
router.get('/admin/submissions', submissionController.listSubmissions);
// Admin: Get details for a specific submission (answers, questions, marks)
router.get('/admin/submissions/:id', submissionController.getSubmissionDetails);
// Admin: Submit grades for a submission
router.post('/admin/grade/:id', submissionController.submitGrades);

module.exports = router;
