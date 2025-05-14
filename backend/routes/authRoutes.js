const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../config/db');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Student login with examId and password
router.post('/student-login', authController.studentLogin);

module.exports = router;
