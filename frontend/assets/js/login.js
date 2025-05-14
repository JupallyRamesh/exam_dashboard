// frontend/assets/js/login.js
import { speak } from './textToSpeech.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const roleSelect = document.getElementById('role');
  const studentFields = document.getElementById('student-fields');
  const adminFields = document.getElementById('admin-fields');
  const errorDiv = document.getElementById('login-error');
  const goRoleSelect = document.getElementById('go-role-select');

  // Role selection logic
  function updateRoleFields() {
    if (roleSelect.value === 'student') {
      studentFields.style.display = '';
      adminFields.style.display = 'none';
      document.getElementById('examId').focus();
    } else {
      studentFields.style.display = 'none';
      adminFields.style.display = '';
      document.getElementById('username').focus();
    }
  }
  roleSelect.addEventListener('change', updateRoleFields);
  updateRoleFields();

  // Navigation: Back to role selection
  if (goRoleSelect) {
    goRoleSelect.onclick = () => {
      window.location.href = 'roleSelect.html';
    };
  }

  if (!loginForm) return;

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    errorDiv.textContent = '';
    const role = roleSelect.value;
    let password;
    let apiUrl, payload, redirectUrl;

    if (role === 'student') {
      const examId = loginForm.examId.value.trim();
      password = document.getElementById('student-password').value.trim();
      if (!examId || !password) {
        speak('Please enter Exam ID and password.');
        errorDiv.textContent = 'Please enter Exam ID and password.';
        return;
      }
      apiUrl = '/api/auth/student-login';
      payload = { examId, password };
      redirectUrl = 'studentDashboard.html';
    } else {
      const username = loginForm.username.value.trim();
      password = document.getElementById('admin-password').value.trim();
      if (!username || !password) {
        speak('Please enter username and password.');
        errorDiv.textContent = 'Please enter username and password.';
        return;
      }
      apiUrl = '/api/auth/login';
      payload = { username, password };
      redirectUrl = 'admin.html';
    }

    try {
      document.getElementById('login-btn').disabled = true;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      speak('Login successful. Redirecting.');
      sessionStorage.setItem('userId', data.user.id);
      sessionStorage.setItem('role', role);
      if (role === 'student') sessionStorage.setItem('examId', payload.examId);
      window.location.href = redirectUrl;
    } catch (err) {
      speak('Login failed. ' + err.message);
      errorDiv.textContent = 'Login failed: ' + err.message;
    } finally {
      document.getElementById('login-btn').disabled = false;
    }
  };
});
