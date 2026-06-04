# Quick Start Guide

Get the EMEA Security Roadshow Quiz up and running in minutes!

## 🚀 Fastest Way to Run

### Option 1: Podman (Recommended)

```bash
# Build and run in one command
./deploy.sh
# Choose option 2 for local deployment

# Or manually:
podman build -t security-quiz .
podman run -d -p 8080:8080 --name security-quiz security-quiz

# Access at http://localhost:8080
```

### Option 2: Local Web Server

```bash
# If you have PHP installed
php -S localhost:8080

# Or use Apache/Nginx
# Just point document root to this directory
```

## ✅ Verify It's Working

1. **Open browser**: `http://localhost:8080`
2. **You should see**: "EMEA Security Roadshow - Knowledge Check"
3. **Test the quiz**: Click "Start Quiz"
4. **Check leaderboard**: Visit `http://localhost:8080/test-write.php`
   - Should show "SUCCESS" if PHP can write files

## 🎯 First Steps

1. **Take the quiz** - No setup needed, just click Start!
2. **Try session filtering** - Select specific topics
3. **Check hints** - Hover over 💡 icons
4. **Toggle dark mode** - Click 🌙 in header
5. **Pass with 70%+** - Get a certificate!

## 🏆 Enable Leaderboard

The leaderboard needs write permissions:

```bash
# Option 1: Use data directory (Docker does this automatically)
mkdir data
chmod 775 data

# Option 2: Make current directory writable
chmod 775 .
chown youruser:apache .
```

Test it: `http://localhost:8080/test-write.php`

## 📱 Mobile Access

The quiz is fully responsive. Access from any device:
- Desktop: Full features
- Tablet: Optimized layout
- Mobile: Touch-friendly

## 🔧 Common Issues

### "Failed to load questions"
- Check `questions.json` exists
- Verify JSON is valid
- Check browser console (F12)

### Leaderboard not working
- Run `test-write.php` to diagnose
- Check permissions (see above)
- See `LEADERBOARD_SETUP.md` for details

### Certificate not downloading
- Check jsPDF library loaded
- Check browser console
- Try different browser

## 📚 What's Next?

- **Read README.md** - Full documentation
- **Customize questions** - Edit `questions.json`
- **Deploy to OpenShift** - Use `./deploy.sh`
- **Add more features** - It's all open source!

## 🎓 Quiz Features at a Glance

- ✅ 127 questions across 8 topics
- ✅ 15 questions per quiz (randomized)
- ✅ Multi-select session filtering
- ✅ Hint tooltips for guidance
- ✅ Dark mode toggle
- ✅ PDF certificates (70%+ passing)
- ✅ Opt-in leaderboard
- ✅ Mobile responsive
- ✅ No database required

## 💡 Pro Tips

1. **Practice mode**: Use session filters to focus on weak areas
2. **Study hints**: They guide you to the right thinking
3. **Review answers**: Always check the detailed explanations
4. **Dark mode**: Easy on the eyes for long study sessions
5. **Leaderboard**: Opt-in to compete with colleagues!

---

**Need help?** Check README.md or LEADERBOARD_SETUP.md for detailed documentation.
