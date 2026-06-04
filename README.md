# EMEA Security Roadshow - Knowledge Check

An interactive web-based quiz application designed to test and reinforce knowledge from the EMEA Security Roadshow training sessions.

## 📚 Overview

This quiz covers all seven sessions from the EMEA Security Roadshow, plus additional content on Red Hat Hardened Images:

- **Product Security as a Value Driver**
- **Proactive Security (Secure SDLC)**
- **Reactive Security (Vulnerability Management)**
- **Project Lightwell**
- **Governance, Risk, and Compliance (GRC)**
- **Digital Sovereignty**
- **Confirmed Sovereign Support (CSS)**
- **Red Hat Hardened Images**

## ✨ Features

### Quiz Functionality
- **127 questions** across 8 sessions (15+ per session)
- **15 random questions** per quiz attempt
- **70% passing threshold** (11/15 correct)
- **Randomized answer options** to prevent memorization
- **Multiple choice format** with detailed explanations
- **Hint tooltips** (💡) for guidance without revealing answers
- **Session filtering** - take quizzes on specific topics or combinations
- **No time limit** - learn at your own pace

### User Experience
- **Dark mode toggle** 🌙 with persistent preference
- **Progress tracking** with visual progress bar
- **Trophy celebration** 🏆 for passing scores
- **PDF certificate download** for passing scores
- **Answer review** with detailed explanations
- **Session breakdown** showing performance by topic
- **Responsive design** - works on desktop and mobile
- **Red Hat branded** with professional styling

### Leaderboard
- **Opt-in only** - users choose to share scores
- **Public leaderboard** showing top 50 scores
- **Medal rankings** - 🥇 🥈 🥉 for top 3
- **Session tracking** - see which topics were covered
- **Privacy-focused** - explicitly requires consent

## 🚀 Quick Start

### Running with Podman (Easiest option)

Build the container:
```bash
podman build -t security-quiz:latest .
```

Run the container:
```bash
podman run -d -p 8080:8080 --name security-quiz security-quiz:latest
```

Access at: `http://localhost:8080/`

### Running on OpenShift

```bash
# Create a new app from the Dockerfile
oc new-app https://github.com/your-repo/security-quiz --name=security-quiz

# Expose the service
oc expose svc/security-quiz

# Get the route
oc get route security-quiz
```

### Running Locally

1. **Clone or copy the files** to your web server directory
2. **Ensure PHP is installed** (PHP 7.4+ recommended)
3. **Set proper permissions**:
   ```bash
   chmod 755 /path/to/security-quiz
   chmod 775 /path/to/security-quiz  # For leaderboard CSV writing
   ```
4. **Access via browser**: `http://localhost/security-quiz/`



## 📂 File Structure

```
security-quiz/
├── index.html              # Main quiz interface
├── quiz.js                 # Quiz logic and functionality
├── style.css               # Styling and themes
├── questions.json          # Question bank (127 questions)
├── save-score.php          # Leaderboard score submission
├── get-leaderboard.php     # Leaderboard data retrieval
├── test-results.html       # Testing page for UI preview
├── images/                 # Red Hat logo and assets
├── Dockerfile              # Container definition
├── README.md               # This file
└── LEADERBOARD_SETUP.md    # Leaderboard troubleshooting guide

Data files (auto-created):
├── data/                   # Container data directory
│   └── leaderboard.csv     # Leaderboard scores
└── leaderboard.csv         # Leaderboard (local deployment)
```

## 🎓 Usage

### Taking the Quiz

1. **Choose session filter** (optional) - select one or more topics
2. **Click "Start Quiz"** - begins with 15 random questions
3. **Answer questions** - click an option to select
4. **View hints** - hover over 💡 for guidance
5. **Submit quiz** - see results after question 15

### Passing & Certificate

- **Pass with 70%+** to unlock the certificate
- **Enter your name** for the certificate
- **Opt-in to leaderboard** (optional checkbox)
- **Download PDF certificate** with your score
- **View leaderboard** to see top performers

### Session Filtering

- **All Sessions** - 15 questions from entire bank (127 questions)
- **Single Session** - 15 questions from one topic
- **Multiple Sessions** - 15 questions from selected topics
- **Examples**:
  - GRC + Digital Sovereignty + CSS = Sovereignty-focused quiz
  - Product Security + Proactive + Reactive = Complete security quiz

## 🔧 Configuration

### Leaderboard Setup

The leaderboard requires PHP write permissions. See `LEADERBOARD_SETUP.md` for detailed setup instructions.

**Quick setup:**
```bash
# Set directory permissions
chmod 775 /path/to/security-quiz

# Set group ownership (for Apache)
chown youruser:apache /path/to/security-quiz

# Or create data directory manually
mkdir data
chmod 775 data
```

### Customization

**Modify passing score** - Edit `questions.json`:
```json
{
  "quiz_title": "EMEA Security Roadshow Knowledge Check",
  "passing_score": 70,
  ...
}
```

**Change questions per quiz** - Edit `quiz.js`:
```javascript
this.questionsPerQuiz = 15;  // Change to desired number
```

**Disable dark mode** - Remove dark mode toggle from `index.html`

## 🧪 Testing

### Test Quiz Functionality
1. Visit `http://localhost/security-quiz/`
2. Take quiz and verify scoring
3. Check certificate download
4. Test dark mode toggle
5. Try session filtering

### Test Leaderboard
1. Visit `http://localhost/security-quiz/test-write.php`
2. Should show "SUCCESS: PHP can write files"
3. If error, check permissions (see `LEADERBOARD_SETUP.md`)

### Test Results Preview
1. Visit `http://localhost/security-quiz/test-results.html`
2. See passing/failing result screens
3. Test certificate download

## 📊 Question Bank

- **Total Questions**: 127
- **Product Security as a Value Driver**: 15 questions
- **Proactive Security (Secure SDLC)**: 18 questions
- **Reactive Security (Vulnerability Management)**: 15 questions
- **Project Lightwell**: 17 questions
- **Governance, Risk, and Compliance (GRC)**: 15 questions
- **Digital Sovereignty**: 16 questions
- **Confirmed Sovereign Support (CSS)**: 15 questions
- **Red Hat Hardened Images**: 15 questions

Each question includes:
- Multiple choice options (4 options)
- Correct answer
- Detailed explanation
- Helpful hint

## 🔒 Security & Privacy

- **Input sanitization** - All user inputs are sanitized
- **XSS prevention** - HTML entities encoded
- **Opt-in leaderboard** - Explicit consent required
- **No authentication** - Public quiz, no login required
- **No tracking** - No analytics or user tracking
- **Local storage only** - Dark mode preference stored in browser

## 🐛 Troubleshooting

### Leaderboard not working
- Check PHP is installed: `php -v`
- Verify write permissions: `ls -la`
- Check Apache error logs
- See `LEADERBOARD_SETUP.md` for detailed troubleshooting

### Questions not loading
- Check browser console (F12)
- Verify `questions.json` is accessible
- Check JSON syntax validity

### Dark mode not persisting
- Check browser allows localStorage
- Check for private/incognito mode
- Clear browser cache

## 📝 Adding Questions

Edit `questions.json` to add questions:

```json
{
  "id": 128,
  "session": "Session Name",
  "question": "Your question here?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correct_answer": 0,
  "explanation": "Detailed explanation of the correct answer.",
  "hint": "Helpful hint without revealing the answer."
}
```

## 🤝 Contributing

To add more questions:
1. Follow the JSON format above
2. Ensure at least 15 questions per session
3. Write clear explanations and hints
4. Test thoroughly before deploying

## 📄 License

**Confidential - Red Hat associates only. No further distribution.**

This quiz contains confidential Red Hat training materials and is intended for internal use only.

## 👥 Credits

Created for the EMEA Security Roadshow 2026

**Content Sources:**
- EMEA Security Roadshow training materials
- Red Hat Product Security documentation
- Red Hat Hardened Images documentation

## 🆘 Support

For issues or questions:
1. Check `LEADERBOARD_SETUP.md` for leaderboard issues
2. Check browser console for JavaScript errors
3. Verify PHP setup with `test-write.php`
4. Check Apache error logs

## 🔄 Version History

### Version 1.0.0 (June 2026)
- Initial release
- 127 questions across 8 sessions
- Dark mode support
- Session filtering (multi-select)
- Hint tooltips
- PDF certificate generation
- Opt-in leaderboard
- Randomized answer options
- Responsive design

---

**Built with:** HTML5, CSS3, JavaScript (ES6+), PHP 8+, jsPDF, Podman/UBI9
