// frontend/assets/js/admin.js
import { speak } from './textToSpeech.js';

// Utility: fetch wrapper with error handling
async function apiFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

function renderUsers(users) {
  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.email}</td><td>${u.role}</td><td>${u.full_name}</td><td><button data-id="${u.id}" class="remove-user">Remove</button></td>`;
    tbody.appendChild(tr);
  });
}

function renderExams(exams) {
  const tbody = document.querySelector('#exams-table tbody');
  tbody.innerHTML = '';
  exams.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.id}</td><td>${e.title}</td><td>${e.start_time}</td><td>${e.end_time}</td><td><button data-id="${e.id}" class="remove-exam">Remove</button></td>`;
    tbody.appendChild(tr);
  });
}

async function refreshUsers() {
  try {
    const { users } = await apiFetch('/api/admin/users');
    renderUsers(users);
    speak('User list updated.');
  } catch (err) { alert('Error: ' + err.message); }
}

async function refreshExams() {
  try {
    const { exams } = await apiFetch('/api/admin/exams');
    renderExams(exams);
    speak('Exam list updated.');
  } catch (err) { alert('Error: ' + err.message); }
}

document.getElementById('refresh-users').onclick = refreshUsers;
document.getElementById('refresh-exams').onclick = refreshExams;

document.getElementById('logout-btn').onclick = () => {
  sessionStorage.clear();
  window.location.href = 'login.html';
};

document.getElementById('add-user-form').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: f.username.value,
        email: f.email.value,
        password: f.password.value,
        full_name: f.full_name.value,
        role: f.role.value
      })
    });
    refreshUsers();
    f.reset();
    speak('User added.');
  } catch (err) { alert('Error: ' + err.message); }
};

document.getElementById('users-table').onclick = async (e) => {
  if (e.target.classList.contains('remove-user')) {
    const id = e.target.getAttribute('data-id');
    if (confirm('Remove user?')) {
      try {
        await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        refreshUsers();
        speak('User removed.');
      } catch (err) { alert('Error: ' + err.message); }
    }
  }
};

document.getElementById('add-exam-form').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await apiFetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: f.title.value,
        duration: f.duration.value,
        start_time: f.start_time.value.replace('T',' '),
        end_time: f.end_time.value.replace('T',' ')
      })
    });
    refreshExams();
    f.reset();
    speak('Exam added.');
  } catch (err) { alert('Error: ' + err.message); }
};

document.getElementById('exams-table').onclick = async (e) => {
  if (e.target.classList.contains('remove-exam')) {
    const id = e.target.getAttribute('data-id');
    if (confirm('Remove exam?')) {
      try {
        await apiFetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
        refreshExams();
        speak('Exam removed.');
      } catch (err) { alert('Error: ' + err.message); }
    }
  }
};

// Manual Grading & Results
async function refreshSubmissions() {
  const tbody = document.querySelector('#submissions-table tbody');
  const errorDiv = document.getElementById('grading-error-status');
  tbody.innerHTML = '';
  errorDiv.textContent = '';
  try {
    const { submissions } = await apiFetch('/api/admin/submissions');
    submissions.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.id}</td><td>${s.exam_title}</td><td>${s.user_name}</td><td>${s.status}</td><td><button class="grade-btn" data-id="${s.id}">Grade</button></td>`;
      tbody.appendChild(tr);
    });
    speak('Submissions list updated.');
  } catch (err) {
    errorDiv.textContent = 'Error: ' + err.message;
  }
}

document.getElementById('refresh-submissions').onclick = refreshSubmissions;

document.getElementById('submissions-table').onclick = async (e) => {
  if (e.target.classList.contains('grade-btn')) {
    const subId = e.target.getAttribute('data-id');
    showGradingPanel(subId);
  }
};

// Simple grading panel/modal logic (inline for accessibility)
async function showGradingPanel(subId) {
  const errorDiv = document.getElementById('grading-error-status');
  errorDiv.textContent = '';
  try {
    const { submission, answers } = await apiFetch(`/api/admin/submissions/${subId}`);
    let panel = document.getElementById('grading-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'grading-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'grading-title');
      document.body.appendChild(panel);
    }
    panel.innerHTML = `<h4 id="grading-title">Grading Submission #${subId}</h4>` +
      answers.map(a => `
        <div><strong>Q:</strong> ${a.question_text}</div>
        <div><strong>A:</strong> ${a.answer_text}</div>
        <label for="marks-${a.id}">Marks:</label>
        <input type="number" id="marks-${a.id}" name="marks-${a.id}" min="0" max="${a.max_marks}" value="${a.marks_obtained ?? ''}" aria-label="Marks for question">
        <br>`).join('') +
      `<button id="submit-grade-btn">Submit Grade</button> <button id="close-grade-btn">Close</button>`;
    panel.style.position = 'fixed';
    panel.style.top = '10%';
    panel.style.left = '50%';
    panel.style.transform = 'translateX(-50%)';
    panel.style.background = '#fff';
    panel.style.padding = '1em';
    panel.style.zIndex = 1000;
    panel.focus();
    document.getElementById('close-grade-btn').onclick = () => panel.remove();
    document.getElementById('submit-grade-btn').onclick = async () => {
      const marks = {};
      answers.forEach(a => {
        marks[a.id] = Number(document.getElementById(`marks-${a.id}`).value);
      });
      try {
        await apiFetch(`/api/admin/grade/${subId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ marks })
        });
        speak('Grading submitted.');
        errorDiv.textContent = 'Grading submitted.';
        panel.remove();
        refreshSubmissions();
      } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
      }
    };
    // Move focus to dialog for accessibility
    setTimeout(() => panel.focus(), 100);
  } catch (err) {
    errorDiv.textContent = 'Error: ' + err.message;
  }
}

// Initial load
// (No automatic fetch; admin must click Refresh buttons)
