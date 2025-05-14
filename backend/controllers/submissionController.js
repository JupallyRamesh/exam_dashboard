// backend/controllers/submissionController.js
const db = require('../config/db');

exports.submitExam = (req, res) => {
  const { user_id, exam_id, answers } = req.body;
  if (!user_id || !exam_id || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'user_id, exam_id and answers array are required'
    });
  }

  // First, get all questions and their correct answers for this exam
  const getQuestionsSql = `
    SELECT id, question_type, correct_answer, marks
    FROM questions
    WHERE exam_id = ?
  `;

  db.query(getQuestionsSql, [exam_id], (err, questions) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }

    // Create a map of question_id to correct answer and marks
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q.id] = {
        type: q.question_type,
        correct_answer: q.correct_answer,
        marks: q.marks
      };
    });

    // Calculate marks for each answer
    const values = answers.map(a => {
      const question = questionMap[a.question_id];
      let marks_obtained = 0;

      if (question) {
        if (question.type === 'objective') {
          // Debug logging for answer comparison
          console.log('Processing answer:', {
            questionId: a.question_id,
            userAnswer: a.answer_text,
            correctAnswer: question.correct_answer,
            questionType: question.type,
            possibleMarks: question.marks
          });

          // For objective questions, compare the actual answer text
          const userAnswer = String(a.answer_text).toLowerCase().trim();
          const correctAnswer = String(question.correct_answer).toLowerCase().trim();

          // Debug logging for comparison
          console.log('Comparing answers:', {
            userAnswer,
            correctAnswer,
            isMatch: userAnswer === correctAnswer
          });

          // Case-insensitive comparison of actual answer text
          marks_obtained = userAnswer === correctAnswer ? question.marks : 0;

          console.log('Marks awarded:', marks_obtained);
        } else {
          // For subjective questions, check for similarity
          const correctKeywords = question.correct_answer.toLowerCase().trim().split(/\s+/);
          const userKeywords = a.answer_text.toLowerCase().trim().split(/\s+/);
          const matchCount = correctKeywords.filter(word => userKeywords.includes(word)).length;
          const similarity = matchCount / correctKeywords.length;

          // Award full marks if similarity is above 80%, partial marks if above 50%
          if (similarity >= 0.8) {
            marks_obtained = question.marks;
          } else if (similarity >= 0.5) {
            marks_obtained = Math.ceil(question.marks * 0.5);
          }
        }
      }

      // Debug logging for final marks
      console.log('Final marks for question:', {
        questionId: a.question_id,
        marksObtained: marks_obtained,
        maxMarks: question ? question.marks : 'unknown'
      });

      return [user_id, exam_id, a.question_id, a.answer_text, marks_obtained];
    });

    const sql = `
      INSERT INTO user_answers (user_id, exam_id, question_id, answer_text, marks_obtained)
      VALUES ?
    `;

    db.query(sql, [values], (insertErr, result) => {
      if (insertErr) {
        return res.status(500).json({ success: false, message: 'Database error', error: insertErr });
      }
      res.json({
        success: true,
        message: 'Exam submitted and graded successfully',
        rowsInserted: result.affectedRows
      });
    });
  });
};

// ADMIN: List all submissions for grading
exports.listSubmissions = (req, res) => {
  const sql = `
    SELECT ua.exam_id, ua.user_id, ua.id, e.title AS exam_title, u.username AS user_name,
      CASE WHEN ua.graded = 1 THEN 'Graded' ELSE 'Pending' END AS status
    FROM user_answers ua
    JOIN users u ON ua.user_id = u.id
    JOIN exams e ON ua.exam_id = e.id
    GROUP BY ua.exam_id, ua.user_id
    ORDER BY ua.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
    res.json({ success: true, submissions: results });
  });
};

// ADMIN: Get details for a single submission
exports.getSubmissionDetails = (req, res) => {
  const subId = req.params.id;
  // Find all answers for this submission (by user/exam)
  const sql = `
    SELECT ua.id AS answer_id, q.text AS question_text, ua.answer_text, ua.marks_obtained, q.marks AS max_marks
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.id = ? OR (ua.exam_id = (SELECT exam_id FROM user_answers WHERE id = ?) AND ua.user_id = (SELECT user_id FROM user_answers WHERE id = ?))
  `;
  db.query(sql, [subId, subId, subId], (err, answers) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
    res.json({ success: true, submission: subId, answers });
  });
};

// ADMIN: Submit grades for a submission
exports.submitGrades = (req, res) => {
  const subId = req.params.id;
  const marks = req.body.marks;
  if (!marks || typeof marks !== 'object') {
    return res.status(400).json({ success: false, message: 'Marks object required' });
  }
  // Update marks for each answer
  const updates = Object.entries(marks);
  let completed = 0, errored = false;
  updates.forEach(([answerId, mark]) => {
    db.query('UPDATE user_answers SET marks_obtained=?, graded=1 WHERE id=?', [mark, answerId], (err) => {
      if (errored) return;
      if (err) {
        errored = true;
        return res.status(500).json({ success: false, message: 'Database error', error: err });
      }
      completed++;
      if (completed === updates.length && !errored) {
        res.json({ success: true, message: 'Grades submitted' });
      }
    });
  });
};
