const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

// POST /api/results/autograde
router.post('/autograde',   resultController.autoGrade);

// POST /api/results/manualgrade
router.post('/manualgrade', resultController.manualGrade);

// GET  /api/results/:exam_id/:user_id
router.get('/:exam_id/:user_id', resultController.getResult);

module.exports = router;
