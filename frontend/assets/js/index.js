import { speak } from './textToSpeech.js';

document.addEventListener('DOMContentLoaded', async () => {
  const ul = document.getElementById('exam-list');

  try {
    // 1. Fetch the exams
    const res  = await fetch('/api/exams/list');
    const { success, exams, message } = await res.json();
    if (!success) throw new Error(message);

    // 2. Render each exam as a list item
    exams.forEach(exam => {
      const li = document.createElement('li');
      li.innerText = `${exam.title} — ${exam.start_time}`;
      li.tabIndex = 0;              // make keyboard focusable
      li.onclick  = () => startExam(exam.id);
      li.onkeyup  = e => { 
        if (e.key === 'Enter') startExam(exam.id);
      };
      ul.appendChild(li);

      // 3. Speak each exam title
      speak(`Exam: ${exam.title}. Starts at ${exam.start_time}`);
    });

    // If no exams, show placeholder
    if (exams.length === 0) {
      ul.innerHTML = '<li>No exams available.</li>';
    }

  } catch (err) {
    console.error(err);
    ul.innerHTML = `<li>Error loading exams: ${err.message}</li>`;
  }

  // 4. Handler to navigate to the chosen exam
  function startExam(examId) {
    sessionStorage.setItem('examId', examId);
    window.location.href = `../pages/exam.html?examId=${examId}`;
  }
});
