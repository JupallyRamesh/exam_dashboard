// frontend/assets/js/register.js
import { speak } from './textToSpeech.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    const full_name = registerForm.full_name.value.trim();
    if (!username || !email || !password || !full_name) {
      speak('Please fill in all required fields.');
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, full_name })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      speak('Registration successful. Redirecting to login.');
      window.location.href = 'studentLogin.html';
    } catch (err) {
      speak('Registration failed. ' + err.message);
      alert('Registration failed: ' + err.message);
    }
  };
});
