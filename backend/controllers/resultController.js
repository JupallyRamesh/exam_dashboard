const db = require('../config/db');

// Auto-grade objective questions for a given exam and user
exports.autoGrade = (req, res) => {
  const { exam_id, user_id } = req.body;
  if (!exam_id || !user_id) {
    return res.status(400).json({ success: false, message: 'exam_id and user_id are required' });
  }

  // Fetch all objective answers for this exam & user
  const fetchSql = `
    SELECT ua.id AS ua_id, ua.answer_text, q.correct_answer, q.marks
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.exam_id = ? AND ua.user_id = ? AND q.question_type = 'objective'
  `;

  db.query(fetchSql, [exam_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });

    // Prepare bulk update data: [marks_obtained, ua_id]
    const updates = rows.map(r => {
      const earned = (r.answer_text === r.correct_answer) ? r.marks : 0;
      return [earned, r.ua_id];
    });
    if (updates.length === 0) {
      return res.json({ success: true, message: 'No objective answers to grade' });
    }

    // Bulk update marks_obtained
    const updateSql = 'UPDATE user_answers SET marks_obtained = ? WHERE id = ?';
    let completed = 0, errors = [];
    updates.forEach(([marks, ua_id]) => {
      db.query(updateSql, [marks, ua_id], (uErr) => {
        completed++;
        if (uErr) errors.push(uErr);
        if (completed === updates.length) {
          if (errors.length) {
            return res.status(500).json({ success: false, message: 'Some updates failed', error: errors });
          }
          return res.json({ success: true, message: 'Auto-grading complete', gradedCount: updates.length });
        }
      });
    });
  });
};

// Manually grade a subjective answer
exports.manualGrade = (req, res) => {
  const { answer_id, marks_obtained } = req.body;
  if (!answer_id || marks_obtained == null) {
    return res.status(400).json({ success: false, message: 'answer_id and marks_obtained are required' });
  }
  const sql = 'UPDATE user_answers SET marks_obtained = ? WHERE id = ?';
  db.query(sql, [marks_obtained, answer_id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    res.json({ success: true, message: 'Manual grading saved' });
  });
};

// Fetch overall result (total and per-question) for a user’s exam
exports.getResult = (req, res) => {
  const { exam_id, user_id } = req.params;
  if (!exam_id || !user_id) {
    return res.status(400).json({ success: false, message: 'exam_id and user_id are required' });
  }

  // Fetch each answer with its marks, plus sum total
  const sql = `
    SELECT 
      ua.id, ua.question_id, ua.answer_text, ua.marks_obtained,
      q.question_text, q.marks AS max_marks
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.exam_id = ? AND ua.user_id = ?
  `;
  db.query(sql, [exam_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    const totalObtained = rows.reduce((sum, r) => sum + r.marks_obtained, 0);
    const totalMax      = rows.reduce((sum, r) => sum + r.max_marks, 0);
    res.json({
      success: true,
      summary: { totalObtained, totalMax },
      details: rows
    });
  });
};
