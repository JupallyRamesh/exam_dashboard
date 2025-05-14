const autoGradingService = {
    // Grade MCQ questions
    gradeMCQ: (userAnswer, correctAnswer) => {
        return userAnswer === correctAnswer ? 1 : 0;
    },
    
    // Grade multiple select questions
    gradeMultiSelect: (userAnswers, correctAnswers) => {
        const correct = userAnswers.every(ans => correctAnswers.includes(ans));
        const complete = correctAnswers.every(ans => userAnswers.includes(ans));
        return correct && complete ? 1 : 0;
    },
    
    // Grade fill in the blanks
    gradeFillBlanks: (userAnswer, correctAnswer) => {
        // Case-insensitive comparison
        return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ? 1 : 0;
    },
    
    // Grade true/false
    gradeTrueFalse: (userAnswer, correctAnswer) => {
        return userAnswer === correctAnswer ? 1 : 0;
    },
    
    // Calculate total score
    calculateScore: (answers, correctAnswers) => {
        let totalScore = 0;
        let totalQuestions = 0;
        
        for (const [questionId, answer] of Object.entries(answers)) {
            const correct = correctAnswers[questionId];
            if (!correct) continue;
            
            totalQuestions++;
            
            switch (correct.type) {
                case 'mcq':
                    totalScore += autoGradingService.gradeMCQ(answer, correct.answer);
                    break;
                case 'multiselect':
                    totalScore += autoGradingService.gradeMultiSelect(answer, correct.answer);
                    break;
                case 'fillblanks':
                    totalScore += autoGradingService.gradeFillBlanks(answer, correct.answer);
                    break;
                case 'truefalse':
                    totalScore += autoGradingService.gradeTrueFalse(answer, correct.answer);
                    break;
            }
        }
        
        return {
            score: totalScore,
            total: totalQuestions,
            percentage: (totalScore / totalQuestions) * 100
        };
    }
};

module.exports = autoGradingService;
