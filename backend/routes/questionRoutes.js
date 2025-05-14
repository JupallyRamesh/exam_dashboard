// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// POST /api/questions/create
router.post('/create', questionController.createQuestion);

// GET /api/questions/list/:examId
router.get('/list/:examId', questionController.listQuestionsByExamId);

module.exports = router;

