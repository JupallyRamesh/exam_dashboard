const db = require('../config/db');
const bcrypt = require('bcrypt');

// USERS
exports.listUsers = (req, res) => {
  db.query('SELECT id, username, email, role, full_name FROM users', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    res.json({ success: true, users: results });
  });
};

exports.addUser = (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ success: false, message: 'Hash error', error: err });
    db.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES (?,?,?,?,?)',
      [username, email, hash, full_name, role || 'student'],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, message: 'DB error', error: err2 });
        res.json({ success: true, userId: result.insertId });
      }
    );
  });
};

exports.removeUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    res.json({ success: true, removed: result.affectedRows });
  });
};

// EXAMS
exports.listExams = (req, res) => {
  db.query('SELECT * FROM exams', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    res.json({ success: true, exams: results });
  });
};

exports.addExam = (req, res) => {
  const { title, duration, start_time, end_time } = req.body;
  if (!title || !duration || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  db.query(
    'INSERT INTO exams (title, duration, start_time, end_time) VALUES (?,?,?,?)',
    [title, duration, start_time, end_time],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
      res.json({ success: true, examId: result.insertId });
    }
  );
};

exports.removeExam = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM exams WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error', error: err });
    res.json({ success: true, removed: result.affectedRows });
  });
};
