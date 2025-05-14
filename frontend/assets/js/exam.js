import { speak } from './textToSpeech.js';
import { startListening } from './speechToText.js';

(() => {
  // 1️⃣ Determine examId & userId dynamically
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('examId')
    || sessionStorage.getItem('examId')
    || 1;
  const userId = sessionStorage.getItem('userId') || 3;

  let questions = [];
  const answers = [];
  let qIndex = 0;
  let selectedOption = null;

  // 2️⃣ Cache DOM elements
  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');
  const qText = document.getElementById('question-text');
  const qList = document.getElementById('options-list');

  // 3️⃣ Start Exam: fetch questions
  startBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`/api/questions/list/${examId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Filter questions by selected subject
      const selectedSubject = sessionStorage.getItem('selectedSubject');
      questions = selectedSubject
        ? data.questions.filter(q => q.subject === selectedSubject)
        : data.questions;
      if (!questions.length) throw new Error('No questions found for the selected subject.');

      startBtn.disabled = true;
      nextBtn.disabled = false;
      showQuestion();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  });

  // 4️⃣ Next Question: handle answer submission
  nextBtn.addEventListener('click', async () => {
    try {
      let answer_text;
      const currentQuestion = questions[qIndex];

      if (currentQuestion.question_type === 'objective') {
        // For objective questions, use the selected option
        if (!selectedOption) {
          speak('Please select an option first');
          return;
        }

        // Debug logging
        console.log('Current question:', currentQuestion);
        console.log('Selected option:', selectedOption);

        // Use the actual answer text
        answer_text = selectedOption;
      } else {
        // For subjective questions, use speech input
        answer_text = await startListening();
      }

      // Debug logging for answer submission
      console.log('Submitting answer:', {
        question_id: currentQuestion.id,
        answer_text: answer_text,
        question_type: currentQuestion.question_type,
        correct_answer: currentQuestion.correct_answer
      });

      answers.push({
        question_id: currentQuestion.id,
        answer_text: answer_text,
        question_type: currentQuestion.question_type
      });

      selectedOption = null; // Reset selection for next question
      qIndex++;

      if (qIndex < questions.length) {
        showQuestion();
      } else {
        finishExam();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert(`Error: ${err.message}`);
    }
  });

  // 5️⃣ Submit Exam: send answers
  submitBtn.addEventListener('click', async () => {
    const payload = { user_id: +userId, exam_id: +examId, answers };
    try {
      const res = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      speak('Exam submitted successfully');
      // persist for results page
      sessionStorage.setItem('examId', examId);
      sessionStorage.setItem('userId', userId);
      window.location.href = 'results.html';
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    }
  });

  // Render the current question
  function showQuestion() {
    const q = questions[qIndex];
    qText.innerText = q.question_text;
    qList.innerHTML = '';
    speak(q.question_text);

    if (q.question_type === 'objective') {
      let opts = q.options;
      if (typeof opts === 'string') {
        try {
          opts = JSON.parse(opts);
        } catch (e) {
          console.error('Error parsing options:', e);
          alert('Invalid options format for question: ' + q.question_text);
          opts = {};
        }
      }

      // Debug logging for options
      console.log('Question options:', opts);
      console.log('Correct answer:', q.correct_answer);

      // Create clickable options
      for (const key in opts) {
        const li = document.createElement('li');
        const optionText = opts[key];
        li.innerText = optionText;
        li.setAttribute('data-option', key);
        li.setAttribute('data-value', optionText); // Store the full option text
        li.classList.add('option');

        // Add click handler for option selection
        li.addEventListener('click', function () {
          // Remove selection from other options
          qList.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
          // Add selection to clicked option
          this.classList.add('selected');
          // Store the full option text
          selectedOption = optionText;
          speak(`Selected ${optionText}`);

          // Debug logging for selection
          console.log('Option selected:', {
            key: key,
            text: optionText,
            selectedAnswer: selectedOption,
            correctAnswer: q.correct_answer
          });
        });

        qList.appendChild(li);
      }

      // Add instruction for objective questions
      speak('Please click on your chosen option or say the option letter');
    } else {
      speak('Please speak your answer when ready');
    }
  }

  // End of exam: toggle buttons
  function finishExam() {
    nextBtn.disabled = true;
    submitBtn.disabled = false;
    speak('You have reached the end of the exam. Please submit your answers.');
  }
})();
