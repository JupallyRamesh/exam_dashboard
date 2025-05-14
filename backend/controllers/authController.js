const bcrypt = require('bcrypt');
const db = require('../config/db');

// Register a new user
exports.register = (req, res) => {
  const { username, email, password, role, full_name } = req.body;

  // Validate input
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Hash the password
  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      return res.status(500).json({ success: false, message: 'Error hashing password', error: hashErr });
    }

    // Insert the new user with hashed password
    db.query(
      'INSERT INTO users (username, email, password, role, full_name) VALUES (?,?,?,?,?)',
      [username, email, hashedPassword, role || 'student', full_name],
      (dbErr, results) => {
        if (dbErr) {
          return res.status(500).json({ success: false, message: 'DB error', error: dbErr });
        }
        // Only assign exams if the role is student (or not specified)
        const isStudent = !role || role === 'student';
        if (!isStudent) {
          return res.json({ success: true, message: 'Registration successful (non-student, no exams assigned)' });
        }
        const userId = results.insertId;
        // Fetch all exams
        db.query('SELECT id FROM exams', (examErr, exams) => {
          if (examErr) {
            return res.status(500).json({ success: false, message: 'Error fetching exams', error: examErr });
          }
          if (!exams.length) {
            return res.status(500).json({ success: false, message: 'No exams found to assign.' });
          }
          // Prepare bulk insert values
          const assignments = exams.map(exam => [userId, exam.id]);
          db.query('INSERT INTO student_exams (user_id, exam_id) VALUES ?', [assignments], (assignErr) => {
            if (assignErr) {
              return res.status(500).json({ success: false, message: 'Error assigning exams', error: assignErr });
            }
            res.json({ success: true, message: 'Registration successful and exams assigned.' });
          });
        });
      }
    );
  });
};

// Student login by examId and password
exports.studentLogin = (req, res) => {
  const { examId, password } = req.body;
  if (!examId || !password) {
    return res.status(400).json({ success: false, message: 'Exam ID and password are required' });
  }
  // Here we assume examId is stored as username for students
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [examId],
    (dbErr, results) => {
      if (dbErr || results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const user = results[0];
      if (user.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Not a student account' });
      }
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr || !isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // Fetch all assigned exam_ids for this student from student_exams
        db.query('SELECT exam_id FROM student_exams WHERE user_id = ?', [user.id], (examErr, examRows) => {
          let exam_ids = [];
          if (!examErr && examRows.length > 0) {
            exam_ids = examRows.map(row => row.exam_id);
          }
          res.json({
            success: true,
            message: 'Student login successful',
            user: {
              id: user.id,
              username: user.username,
              full_name: user.full_name,
              exam_ids: exam_ids
            }
          });
        });
      });
    }
  );
};

// Login an existing user
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  // Find user by username
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (dbErr, results) => {
      if (dbErr || results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = results[0];

      // Compare entered password with stored hashed password
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr || !isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Successful login
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            created_at: user.created_at
          }
        });
      });
    }
  );
};
