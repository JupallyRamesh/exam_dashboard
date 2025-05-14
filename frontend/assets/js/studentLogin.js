// frontend/assets/js/studentLogin.js

document.getElementById('student-login-form').onsubmit = async (e) => {
  e.preventDefault();
  const examId = e.target.examId.value.trim();
  const password = e.target.password.value.trim();
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  if (!examId || !password) {
    errorDiv.textContent = 'Exam ID and password are required.';
    return;
  }

  try {
    // POST to /api/auth/student-login (to be implemented in backend)
    const res = await fetch('/api/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    sessionStorage.setItem('userId', data.user.id);
    // Store all assigned examIds from backend response
    if (Array.isArray(data.user.exam_ids)) {
      sessionStorage.setItem('examIds', JSON.stringify(data.user.exam_ids));
    } else {
      sessionStorage.setItem('examIds', '[]');
    }
    sessionStorage.setItem('role', 'student');
    window.location.href = 'studentDashboard.html';
  } catch (err) {
    errorDiv.textContent = 'Login failed: ' + err.message;
  }
};
