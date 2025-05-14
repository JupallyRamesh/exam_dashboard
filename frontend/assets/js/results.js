// frontend/assets/js/results.js
import { speak } from './textToSpeech.js';

(async () => {
  // 1. Retrieve examId & userId from sessionStorage
  const examId = sessionStorage.getItem('examId');
  const userId = sessionStorage.getItem('userId');

  try {
    // 2. Fetch the results from the backend
    const res = await fetch(`/api/results/${examId}/${userId}`);
    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    // 3. Render the summary
    const summaryDiv = document.getElementById('summary');
    const { totalObtained, totalMax } = data.summary;
    summaryDiv.innerHTML = `<strong>Total Score:</strong> ${totalObtained} / ${totalMax}`;
    speak(`Your total score is ${totalObtained} out of ${totalMax}`);

    // 4. Populate the details table
    const tbody = document.querySelector('#details tbody');
    data.details.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.question_text}</td>
        <td>${row.answer_text}</td>
        <td>${row.marks_obtained}</td>
        <td>${row.max_marks}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert('Error fetching results');
  }

  // 5. Back button handler
  document.getElementById('back-btn').onclick = () => {
    window.location.href = '../index.html';
  };

})();
