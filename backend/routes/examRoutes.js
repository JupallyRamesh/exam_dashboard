const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

// Create exam
router.post('/create', examController.createExam);

// List all exams
router.get('/list', examController.listExams);

// Remove exam
router.post('/remove', examController.removeExam);

module.exports = router;
