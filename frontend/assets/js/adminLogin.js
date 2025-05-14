// frontend/assets/js/adminLogin.js

document.getElementById('admin-login-form').onsubmit = async (e) => {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';

  if (!username || !password) {
    errorDiv.textContent = 'Username and password are required.';
    return;
  }

  try {
    // POST to /api/auth/login (admin login)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success || data.user.role !== 'admin') throw new Error('Invalid admin credentials');
    sessionStorage.setItem('userId', data.user.id);
    sessionStorage.setItem('role', 'admin');
    window.location.href = 'admin.html';
  } catch (err) {
    errorDiv.textContent = 'Login failed: ' + err.message;
  }
};
