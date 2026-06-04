// Quiz Application
class Quiz {
    constructor() {
        this.allQuestions = [];
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.questionsPerQuiz = 15;
        this.selectedSessions = [];

        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.populateSessionFilter();
        this.initDarkMode();
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();
            this.allQuestions = data.questions;
            this.passingScore = data.passing_score || 70;
            console.log(`Loaded ${this.allQuestions.length} questions`);
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load quiz questions. Please refresh the page.');
        }
    }

    setupEventListeners() {
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('retake-btn').addEventListener('click', () => this.resetQuiz());
        document.getElementById('review-btn').addEventListener('click', () => this.showReview());
        document.getElementById('back-to-results-btn').addEventListener('click', () => this.showResults());
        document.getElementById('download-certificate-btn').addEventListener('click', () => this.downloadCertificate());
        document.getElementById('view-leaderboard-btn').addEventListener('click', () => this.showLeaderboard('results'));
        document.getElementById('view-leaderboard-welcome-btn').addEventListener('click', () => this.showLeaderboard('welcome'));
        document.getElementById('back-from-leaderboard-btn').addEventListener('click', () => this.showResults());
        document.getElementById('back-to-welcome-btn').addEventListener('click', () => this.showScreen('welcome-screen'));
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());
    }

    populateSessionFilter() {
        const sessions = [...new Set(this.allQuestions.map(q => q.session))].sort();
        const container = document.getElementById('session-checkboxes');

        sessions.forEach((session, index) => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'session-checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `session-${index}`;
            checkbox.value = session;
            checkbox.addEventListener('change', (e) => this.updateSelectedSessions());

            const label = document.createElement('label');
            label.htmlFor = `session-${index}`;
            label.textContent = session;

            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);

            // Make the whole item clickable
            checkboxItem.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    this.updateSelectedSessions();
                }
            });

            container.appendChild(checkboxItem);
        });
    }

    updateSelectedSessions() {
        const checkboxes = document.querySelectorAll('#session-checkboxes input[type="checkbox"]');
        this.selectedSessions = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    initDarkMode() {
        // Check localStorage for saved preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode-toggle').textContent = '☀️';
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        document.getElementById('dark-mode-toggle').textContent = isDark ? '☀️' : '🌙';
    }

    startQuiz() {
        this.quizQuestions = this.selectRandomQuestions(this.questionsPerQuiz);

        // Don't start if no questions available
        if (this.quizQuestions.length === 0) {
            return;
        }

        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;

        this.showScreen('quiz-screen');
        this.displayQuestion();
    }

    selectRandomQuestions(count) {
        let questionPool = this.allQuestions;

        // Filter by selected sessions if any are checked
        if (this.selectedSessions.length > 0) {
            questionPool = this.allQuestions.filter(q => this.selectedSessions.includes(q.session));
        }

        // Check if we have any questions
        if (questionPool.length === 0) {
            alert('Please select at least one session or leave all unchecked for all sessions.');
            return [];
        }

        const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    displayQuestion() {
        const question = this.quizQuestions[this.currentQuestionIndex];

        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.quizQuestions.length;

        const progress = ((this.currentQuestionIndex + 1) / this.quizQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        document.getElementById('session-badge').textContent = question.session;
        document.getElementById('question-text').textContent = question.question;

        // Set hint tooltip if available
        const hintTooltip = document.getElementById('hint-tooltip');
        if (question.hint) {
            hintTooltip.innerHTML = `<strong>Hint:</strong> ${question.hint}`;
            document.querySelector('.hint-container').style.display = 'block';
        } else {
            document.querySelector('.hint-container').style.display = 'none';
        }

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        // Create shuffled options mapping if not already created for this question
        if (!question.shuffledMapping) {
            // Create array of indices
            const indices = question.options.map((_, i) => i);
            const shuffledIndices = this.shuffleArray(indices);

            question.shuffledMapping = shuffledIndices;
            question.shuffledOptions = shuffledIndices.map(i => question.options[i]);
        }

        // Display shuffled options
        question.shuffledOptions.forEach((option, displayIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + displayIndex)}</span>
                <span class="option-text">${option}</span>
            `;
            // Map back to original index when clicked
            const originalIndex = question.shuffledMapping[displayIndex];
            optionDiv.addEventListener('click', () => this.selectAnswer(originalIndex, displayIndex));
            optionsContainer.appendChild(optionDiv);
        });

        // Check if this question was already answered and restore the selection
        const previousAnswer = this.userAnswers.find(a => a.questionId === question.id);
        if (previousAnswer !== undefined) {
            const options = document.querySelectorAll('.option');
            // Find which display position corresponds to the selected answer
            const displayIndex = question.shuffledMapping.indexOf(previousAnswer.selectedAnswer);
            if (displayIndex !== -1) {
                options[displayIndex].classList.add('selected');
            }
            document.getElementById('next-btn').style.display = 'inline-block';
        } else {
            document.getElementById('next-btn').style.display = 'none';
        }

        // Update button text for last question
        const nextBtn = document.getElementById('next-btn');
        if (this.currentQuestionIndex === this.quizQuestions.length - 1) {
            nextBtn.textContent = 'Submit Quiz';
        } else {
            nextBtn.textContent = 'Next Question';
        }
    }

    selectAnswer(selectedIndex, displayIndex) {
        const question = this.quizQuestions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option');

        // Remove any previous selections
        options.forEach(option => {
            option.classList.remove('selected');
        });

        // Mark the selected option (by display index)
        options[displayIndex].classList.add('selected');

        const isCorrect = selectedIndex === question.correct_answer;

        // Store the answer (but don't show if it's correct yet)
        const answerIndex = this.userAnswers.findIndex(a => a.questionId === question.id);
        const answerData = {
            questionId: question.id,
            question: question.question,
            session: question.session,
            selectedAnswer: selectedIndex,
            correctAnswer: question.correct_answer,
            isCorrect: isCorrect,
            explanation: question.explanation,
            options: question.options
        };

        if (answerIndex >= 0) {
            // Update existing answer
            this.userAnswers[answerIndex] = answerData;
        } else {
            // Add new answer
            this.userAnswers.push(answerData);
        }

        // Show next button
        document.getElementById('next-btn').style.display = 'inline-block';
    }

    nextQuestion() {
        // Check if current question has been answered
        const currentQuestion = this.quizQuestions[this.currentQuestionIndex];
        const answered = this.userAnswers.find(a => a.questionId === currentQuestion.id);

        if (!answered) {
            alert('Please select an answer before proceeding.');
            return;
        }

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.quizQuestions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        // Calculate score
        this.score = this.userAnswers.filter(a => a.isCorrect).length;
        const percentage = Math.round((this.score / this.quizQuestions.length) * 100);
        const passed = percentage >= this.passingScore;

        const resultsHeader = document.getElementById('results-header');

        if (passed) {
            document.getElementById('results-title').innerHTML = `
                <div class="trophy-icon">🏆</div>
                Congratulations!
            `;
        } else {
            document.getElementById('results-title').textContent = 'Quiz Complete';
        }

        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.textContent = `${this.score} / ${this.quizQuestions.length} (${percentage}%)`;
        scoreDisplay.className = `score-display ${passed ? 'pass' : 'fail'}`;

        const resultsMessage = document.getElementById('results-message');
        if (passed) {
            resultsMessage.innerHTML = `
                <p><strong>Excellent work!</strong> You've demonstrated a strong understanding of Red Hat Product Security practices.</p>
                <p>You've successfully passed the EMEA Security Roadshow Knowledge Check.</p>
            `;
        } else {
            resultsMessage.innerHTML = `
                <p>You scored ${percentage}%, which is below the passing threshold of ${this.passingScore}%.</p>
                <p>We recommend reviewing the training materials and taking the quiz again to reinforce your learning.</p>
            `;
        }

        this.displaySessionBreakdown();
        this.displayIncorrectAnswers();

        // Show certificate download option if passed
        const certificateSection = document.getElementById('certificate-section');
        if (passed) {
            certificateSection.style.display = 'block';
            // Auto-submit to leaderboard if opted in when downloading certificate
        } else {
            certificateSection.style.display = 'none';
        }

        this.showScreen('results-screen');
    }

    async submitToLeaderboard(name) {
        const sessions = this.selectedSessions.length > 0
            ? this.selectedSessions.join(', ')
            : 'All Sessions';

        const data = {
            name: name,
            score: this.score,
            total: this.quizQuestions.length,
            sessions: sessions
        };

        try {
            const response = await fetch('save-score.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                return true;
            } else {
                console.error('Failed to submit score to leaderboard');
                return false;
            }
        } catch (error) {
            console.error('Error submitting to leaderboard:', error);
            return false;
        }
    }

    async showLeaderboard(sourceScreen = 'results') {
        this.showScreen('leaderboard-screen');

        // Show/hide back buttons based on source
        const backToResults = document.getElementById('back-from-leaderboard-btn');
        const backToWelcome = document.getElementById('back-to-welcome-btn');

        if (sourceScreen === 'welcome') {
            backToResults.style.display = 'none';
            backToWelcome.style.display = 'inline-block';
        } else {
            backToResults.style.display = 'inline-block';
            backToWelcome.style.display = 'none';
        }

        const container = document.getElementById('leaderboard-container');
        container.innerHTML = '<div class="loading-message">Loading leaderboard...</div>';

        try {
            const response = await fetch('get-leaderboard.php');
            const scores = await response.json();

            if (scores.length === 0) {
                container.innerHTML = '<div class="loading-message">No scores yet. Be the first to make the leaderboard!</div>';
                return;
            }

            let tableHTML = `
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score</th>
                            <th>Sessions</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            scores.forEach((entry, index) => {
                const rank = index + 1;
                const rankClass = rank <= 3 ? `rank-${rank}` : '';
                const rankDisplay = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank;
                const date = new Date(entry.timestamp).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                tableHTML += `
                    <tr>
                        <td class="rank-cell ${rankClass}">${rankDisplay}</td>
                        <td class="name-cell">${entry.name}</td>
                        <td class="score-cell">${entry.score}/${entry.total} (${entry.percentage}%)</td>
                        <td class="sessions-cell">${entry.sessions}</td>
                        <td class="date-cell">${date}</td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            container.innerHTML = '<div class="loading-message">Failed to load leaderboard. Please try again later.</div>';
        }
    }

    displaySessionBreakdown() {
        const sessionStats = {};

        this.userAnswers.forEach(answer => {
            if (!sessionStats[answer.session]) {
                sessionStats[answer.session] = { correct: 0, total: 0 };
            }
            sessionStats[answer.session].total++;
            if (answer.isCorrect) {
                sessionStats[answer.session].correct++;
            }
        });

        const sessionScoresDiv = document.getElementById('session-scores');
        sessionScoresDiv.innerHTML = '';

        Object.keys(sessionStats).sort().forEach(session => {
            const stats = sessionStats[session];
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'session-score-item';
            sessionDiv.innerHTML = `
                <span class="session-name">${session}</span>
                <span class="session-result">${stats.correct} / ${stats.total}</span>
            `;
            sessionScoresDiv.appendChild(sessionDiv);
        });
    }

    displayIncorrectAnswers() {
        const incorrectAnswers = this.userAnswers.filter(answer => !answer.isCorrect);
        const incorrectSection = document.getElementById('incorrect-answers');
        const incorrectList = document.getElementById('incorrect-answers-list');

        if (incorrectAnswers.length === 0) {
            incorrectSection.style.display = 'none';
            return;
        }

        incorrectSection.style.display = 'block';
        incorrectList.innerHTML = '';

        incorrectAnswers.forEach((answer, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'incorrect-answer-item';

            const yourAnswerText = answer.options[answer.selectedAnswer];
            const correctAnswerText = answer.options[answer.correctAnswer];

            itemDiv.innerHTML = `
                <div class="incorrect-question">
                    <strong>Question ${this.userAnswers.indexOf(answer) + 1}:</strong> ${answer.question}
                </div>
                <div class="incorrect-answer-details your-incorrect-answer">
                    <span class="answer-label incorrect">✗ Your Answer:</span>
                    ${String.fromCharCode(65 + answer.selectedAnswer)}) ${yourAnswerText}
                </div>
                <div class="incorrect-answer-details correct-answer-display">
                    <span class="answer-label correct">✓ Correct Answer:</span>
                    ${String.fromCharCode(65 + answer.correctAnswer)}) ${correctAnswerText}
                </div>
            `;

            incorrectList.appendChild(itemDiv);
        });
    }

    showReview() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';

        this.userAnswers.forEach((answer, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `review-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

            const yourAnswerText = answer.options[answer.selectedAnswer];
            const correctAnswerText = answer.options[answer.correctAnswer];

            reviewItem.innerHTML = `
                <div class="session-badge">${answer.session}</div>
                <div class="review-question">
                    <strong>Question ${index + 1}:</strong> ${answer.question}
                </div>
                <div class="review-answer your-answer">
                    <strong>Your Answer:</strong> ${String.fromCharCode(65 + answer.selectedAnswer)}) ${yourAnswerText}
                    ${answer.isCorrect ? '✓' : '✗'}
                </div>
                ${!answer.isCorrect ? `
                    <div class="review-answer correct-answer">
                        <strong>Correct Answer:</strong> ${String.fromCharCode(65 + answer.correctAnswer)}) ${correctAnswerText}
                    </div>
                ` : ''}
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${answer.explanation}
                </div>
            `;

            reviewContainer.appendChild(reviewItem);
        });

        this.showScreen('review-screen');
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.showScreen('welcome-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    async downloadCertificate() {
        const name = document.getElementById('certificate-name').value.trim() || 'Participant';
        const optIn = document.getElementById('leaderboard-opt-in').checked;

        // Submit to leaderboard if opted in
        if (optIn && name !== 'Participant') {
            await this.submitToLeaderboard(name);
        }

        const score = this.score;
        const total = this.quizQuestions.length;
        const percentage = Math.round((score / total) * 100);
        const date = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Background (white)
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Red border
        doc.setDrawColor(238, 0, 0);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner border
        doc.setDrawColor(21, 21, 21);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Title - CERTIFICATE OF COMPLETION
        doc.setTextColor(238, 0, 0);
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 40, { align: 'center' });

        // Subtitle
        doc.setTextColor(21, 21, 21);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'normal');
        doc.text('EMEA Security Roadshow - Knowledge Check', pageWidth / 2, 52, { align: 'center' });

        // "This certifies that" text
        doc.setTextColor(106, 110, 115);
        doc.setFontSize(14);
        doc.text('This certifies that', pageWidth / 2, 75, { align: 'center' });

        // Name
        doc.setTextColor(21, 21, 21);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text(name, pageWidth / 2, 90, { align: 'center' });

        // Name underline
        const nameWidth = doc.getTextWidth(name);
        doc.setDrawColor(238, 0, 0);
        doc.setLineWidth(0.8);
        doc.line(pageWidth / 2 - nameWidth / 2, 93, pageWidth / 2 + nameWidth / 2, 93);

        // Achievement text
        doc.setTextColor(106, 110, 115);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('has successfully demonstrated comprehensive knowledge of', pageWidth / 2, 108, { align: 'center' });
        doc.text('Red Hat Product Security practices and achieved a score of', pageWidth / 2, 116, { align: 'center' });

        // Score
        doc.setTextColor(62, 134, 53);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score} / ${total} (${percentage}%)`, pageWidth / 2, 130, { align: 'center' });

        // Topics covered
        doc.setTextColor(21, 21, 21);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Topics covered:', pageWidth / 2, 148, { align: 'center' });

        doc.setTextColor(106, 110, 115);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const topics = [
            'Product Security as a Value Driver • Proactive & Reactive Security',
            'Vulnerability Management • Project Lightwell • GRC',
            'Digital Sovereignty • Confirmed Sovereign Support'
        ];
        topics.forEach((topic, index) => {
            doc.text(topic, pageWidth / 2, 158 + (index * 7), { align: 'center' });
        });

        // Date
        doc.setTextColor(21, 21, 21);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Completed: ${date}`, pageWidth / 2, 185, { align: 'center' });

        // Download PDF
        doc.save(`Red_Hat_Security_Certificate_${name.replace(/\s+/g, '_')}.pdf`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});
