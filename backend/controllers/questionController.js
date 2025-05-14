// controllers/questionController.js
const db = require('../config/db');

// GET /api/questions/list/:examId
exports.listQuestionsByExamId = (req, res) => {
  const { examId } = req.params;
  if (!examId) {
    return res.status(400).json({ success: false, message: 'examId is required' });
  }
  const sql = `SELECT * FROM questions WHERE exam_id = ? ORDER BY id`;
  db.query(sql, [examId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, questions: results });
  });
};

exports.createQuestion = (req, res) => {
  const { exam_id, subject, question_text, question_type, options, correct_answer, marks } = req.body;

  // Validation
  if (!exam_id || !subject || !question_text || !question_type || !correct_answer) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided' });
  }

  const sql = `
    INSERT INTO questions (exam_id, subject, question_text, question_type, options, correct_answer, marks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [exam_id, subject, question_text, question_type, JSON.stringify(options), correct_answer, marks || 1],
    (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        res.status(500).json({ success: false, message: 'Database error', error: err });
      } else {
        res.json({ success: true, message: 'Question added successfully', questionId: result.insertId });
      }
    }
  );
};
