const db = require('../config/db');

// Controller to create a new exam
exports.createExam = (req, res) => {
  const { title, duration, start_time, end_time } = req.body;

  if (!title || !duration || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const sql = `
    INSERT INTO exams (title, duration, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, duration, start_time, end_time], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }

    // After creating the exam, assign it to all students
    const examId = result.insertId;
    db.query('SELECT id FROM users WHERE role = "student"', (userErr, users) => {
      if (userErr) {
        return res.status(500).json({ success: false, message: 'Exam created but failed to assign to students', error: userErr });
      }
      if (users.length === 0) {
        return res.json({ success: true, message: 'Exam created successfully (no students to assign)', examId });
      }
      const assignments = users.map(user => [user.id, examId]);
      db.query('INSERT INTO student_exams (user_id, exam_id) VALUES ?', [assignments], (assignErr) => {
        if (assignErr) {
          return res.status(500).json({ success: false, message: 'Exam created but failed to assign to students', error: assignErr });
        }
        res.json({ success: true, message: 'Exam created and assigned to all students', examId });
      });
    });
  });
};
// backend/controllers/examController.js



// … your existing createExam …

// New: List all exams
exports.listExams = (req, res) => {
  const sql = `
    SELECT id, title, duration, DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') AS start_time,
           DATE_FORMAT(end_time, '%Y-%m-%d %H:%i:%s')   AS end_time
    FROM exams
    ORDER BY start_time
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'DB error', error: err });
    }
    res.json({ success: true, exams: results });
  });
};

// Remove exam
exports.removeExam = (req, res) => {
  const { exam_id } = req.body;

  if (!exam_id) {
    return res.status(400).json({ success: false, message: 'Exam ID is required' });
  }

  console.log('Attempting to remove exam with ID:', exam_id);

  // First, check if the exam exists
  db.query('SELECT * FROM exams WHERE id = ?', [exam_id], (err, results) => {
    if (err) {
      console.error('Error checking exam existence:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    console.log('Exam found:', results[0]);

    // Start a transaction
    db.beginTransaction(err => {
      if (err) {
        console.error('Error starting transaction:', err);
        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
      }

      console.log('Transaction started');

      // Delete in the correct order to handle all foreign key constraints:
      // 1. First delete from user_answers (it references both exams and questions)
      console.log('Deleting from user_answers...');
      db.query('DELETE FROM user_answers WHERE exam_id = ?', [exam_id], (err) => {
        if (err) {
          console.error('Error deleting user answers:', err);
          return db.rollback(() => {
            res.status(500).json({ success: false, message: 'Error removing user answers', error: err.message });
          });
        }

        console.log('Successfully deleted user answers');

        // 2. Then delete from questions (it references exams)
        console.log('Deleting from questions...');
        db.query('DELETE FROM questions WHERE exam_id = ?', [exam_id], (err) => {
          if (err) {
            console.error('Error deleting questions:', err);
            return db.rollback(() => {
              res.status(500).json({ success: false, message: 'Error removing exam questions', error: err.message });
            });
          }

          console.log('Successfully deleted questions');

          // 3. Then delete from student_exams (it references exams)
          console.log('Deleting from student_exams...');
          db.query('DELETE FROM student_exams WHERE exam_id = ?', [exam_id], (err) => {
            if (err) {
              console.error('Error deleting from student_exams:', err);
              return db.rollback(() => {
                res.status(500).json({ success: false, message: 'Error removing exam assignments', error: err.message });
              });
            }

            console.log('Successfully deleted from student_exams');

            // 4. Finally delete the exam itself
            console.log('Deleting from exams...');
            db.query('DELETE FROM exams WHERE id = ?', [exam_id], (err) => {
              if (err) {
                console.error('Error deleting from exams:', err);
                return db.rollback(() => {
                  res.status(500).json({ success: false, message: 'Error removing exam', error: err.message });
                });
              }

              console.log('Successfully deleted from exams');

              // Commit the transaction
              db.commit(err => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  return db.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error committing transaction', error: err.message });
                  });
                }
                console.log('Transaction committed successfully');
                res.json({ success: true, message: 'Exam removed successfully' });
              });
            });
          });
        });
      });
    });
  });
};
