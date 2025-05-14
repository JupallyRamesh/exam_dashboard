const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Users
router.get('/users', adminController.listUsers);
router.post('/users', adminController.addUser);
router.delete('/users/:id', adminController.removeUser);

// Exams
router.get('/exams', adminController.listExams);
router.post('/exams', adminController.addExam);
router.delete('/exams/:id', adminController.removeExam);

module.exports = router;
