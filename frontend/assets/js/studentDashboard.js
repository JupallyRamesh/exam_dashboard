// frontend/assets/js/studentDashboard.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('studentDashboard.js loaded');
  const examIdsRaw = sessionStorage.getItem('examIds');
  let examIds = [];
  try {
    examIds = JSON.parse(examIdsRaw) || [];
  } catch { examIds = []; }
  console.log('examIdsRaw:', examIdsRaw);
  console.log('examIds:', examIds);
  const userId = sessionStorage.getItem('userId');
  const infoDiv = document.getElementById('exam-info');
  const showBtn = document.getElementById('show-exam-info');
  const startBtn = document.getElementById('start-exam-btn');
  const logoutBtn = document.getElementById('logout-btn');

  console.log('infoDiv:', infoDiv);
  console.log('showBtn:', showBtn);
  console.log('startBtn:', startBtn);
  console.log('logoutBtn:', logoutBtn);

  // Fix: Exit if any required element is missing
  if (!infoDiv || !showBtn || !startBtn || !logoutBtn) {
    console.error('One or more required elements are missing!');
    return;
  }

  if (!examIds.length || !userId) {
    infoDiv.textContent = 'No exams assigned to you.';
    showBtn.disabled = true;
    startBtn.disabled = true;
    return;
  }

  // Add exam selector with exam names
  let selectedExamId = null;
  let examSelector = document.createElement('select');
  examSelector.id = 'exam-selector';
  examSelector.style.marginBottom = '1em';
  showBtn.disabled = true; // Disable until loaded
  // Fetch all exams and build the dropdown
  fetch('/api/exams/list').then(res => res.json()).then(examData => {
    if (!examData.success) throw new Error(examData.message);
    // Only exams assigned to the student
    const assignedExams = examData.exams.filter(e => examIds.includes(e.id));
    assignedExams.forEach((exam, idx) => {
      let opt = document.createElement('option');
      opt.value = exam.id;
      opt.textContent = exam.title + ' (ID: ' + exam.id + ')';
      examSelector.appendChild(opt);
      if (idx === 0) selectedExamId = exam.id; // Set after dropdown is loaded
    });
    if (assignedExams.length > 0) {
      showBtn.disabled = false;
      console.log('Show Exam Info button enabled');
    } else {
      console.warn('No assigned exams found');
    }
  }).catch(err => {
    let opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Error loading exams';
    examSelector.appendChild(opt);
  });
  infoDiv.parentNode.insertBefore(examSelector, infoDiv);
  examSelector.addEventListener('change', () => {
    selectedExamId = examSelector.value;
    infoDiv.textContent = '';
    startBtn.disabled = true;
  });

  showBtn.onclick = async () => {
    console.log('Show Exam Info button clicked. selectedExamId:', selectedExamId);
    infoDiv.textContent = 'Loading...';
    try {
      // Fetch exam info
      const examRes = await fetch(`/api/exams/list`);
      const examData = await examRes.json();
      if (!examData.success) throw new Error(examData.message);
      const exam = examData.exams.find(e => e.id == selectedExamId);
      if (!exam) throw new Error('Exam not found');
      // Fetch questions for this exam
      const qRes = await fetch(`/api/questions/list/${selectedExamId}`);
      const qData = await qRes.json();
      if (!qData.success) throw new Error(qData.message);
      // Group questions by subject
      const subjects = {};
      qData.questions.forEach(q => {
        if (!subjects[q.subject]) subjects[q.subject] = [];
        subjects[q.subject].push(q);
      });
      let html = '<form id="subject-select-form">';
      html += '<div role="region" aria-label="Subjects" style="margin-top:1em">';
      Object.entries(subjects).forEach(([subject, questions], idx) => {
        html += `<div style='margin-bottom:1em;border:1px solid #ccc;padding:1em;border-radius:8px;'>`;
        html += `<input type='radio' name='subject' id='subject-${idx}' value='${subject}' aria-label='Select ${subject}'>`;
        html += `<label for='subject-${idx}'><strong>Subject:</strong> ${subject}</label><br>`;
        html += `<span><strong>Exam:</strong> ${exam.title}<br><strong>Start:</strong> ${exam.start_time}<br><strong>End:</strong> ${exam.end_time}</span>`;
        html += '</div>';
      });
      html += '</div>';
      html += '</form>';
      infoDiv.innerHTML = html;
      startBtn.disabled = true;
      // Enable start only when a subject is selected
      const form = document.getElementById('subject-select-form');
      form.addEventListener('change', e => {
        if (form.subject.value) {
          startBtn.disabled = false;
          sessionStorage.setItem('selectedSubject', form.subject.value);
        }
      });
      startBtn.focus();
    } catch (err) {
      infoDiv.innerHTML = 'Error loading exam info: ' + err.message;
      startBtn.disabled = true;
    }
  };


  startBtn.onclick = () => {
    console.log('Start Exam button clicked. selectedExamId:', selectedExamId);
    window.location.href = 'exam.html?examId=' + selectedExamId;
  };

  logoutBtn.onclick = () => {
    console.log('Logout button clicked.');
    sessionStorage.clear();
    window.location.href = 'studentLogin.html';
  };
});
