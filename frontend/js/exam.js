function createOptions(options) {
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option;
        li.className = 'option';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.setAttribute('tabindex', '0');

        li.addEventListener('click', () => selectOption(li, index));
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectOption(li, index);
            }
        });

        optionsList.appendChild(li);
    });
}

function selectOption(optionElement, index) {
    // Remove selection from all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
    });

    // Select the clicked option
    optionElement.classList.add('selected');
    optionElement.setAttribute('aria-selected', 'true');
    selectedOption = index;

    // Provide audio feedback
    speak(`Selected option ${index + 1}: ${optionElement.textContent}`);
}

// Update the nextQuestion function to handle both types of questions
document.getElementById('next-btn').addEventListener('click', async () => {
    try {
        if (currentQuestion.type === 'objective') {
            if (selectedOption === null) {
                speak("Please select an option before proceeding");
                return;
            }

            const answer = {
                questionId: currentQuestion.id,
                answer: selectedOption.toString(),
                type: 'objective'
            };

            await submitAnswer(answer);
            selectedOption = null; // Reset selection for next question
        } else {
            // Handle subjective questions with speech input
            startListening();
        }
    } catch (error) {
        console.error('Error:', error);
        speak("An error occurred. Please try again.");
    }
}); 