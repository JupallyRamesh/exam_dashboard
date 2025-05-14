const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// 1️⃣ Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// 2️⃣ API middleware
app.use(cors());
app.use(express.json());

// 3️⃣ API routes
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Serve index.html (role selection) as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

// Handle other routes
app.get('*', (req, res) => {
  if (req.path === '/login' || req.path === '/login.html') {
    res.redirect('/');
  } else if (req.path.endsWith('.html')) {
    const htmlFile = path.join(__dirname, '../frontend/pages', path.basename(req.path));
    res.sendFile(htmlFile);
  } else {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
