# 🚀 SIMETRA AI - Quick Start Guide

## 5-Minute Setup

### Step 1: Verify Environment (30 seconds)
```bash
# Check if API key is set
cat .env
# Should show: GEMINI_API_KEY=AIzaSy...
```

✅ API key is already configured!

### Step 2: Start Local Server (1 minute)
```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Server will start at: `http://localhost:3000`

### Step 3: Test the Application (3 minutes)

#### Test 1: Complete a Simulation
1. Open `http://localhost:3000`
2. Click "START TRAINING"
3. Select "CPR" procedure
4. Click "START PROCEDURE"
5. Follow on-screen instructions
6. Complete the simulation
7. View AI evaluation on results page

#### Test 2: Use Chat Assistant
1. Look for floating button (bottom-right corner)
2. Click to open chat
3. Type: "How can I improve my CPR technique?"
4. Wait for AI response (~2 seconds)
5. Try quick suggestion buttons

#### Test 3: API Endpoints
1. Open `http://localhost:3000/test-ai.html`
2. Click "Test Evaluation API"
3. Click "Send Message" in chat section
4. Verify both return successful responses

## ✅ Success Indicators

You'll know it's working when you see:

### Evaluation Page
- ✅ "GEMINI AI EVALUATION" section appears
- ✅ Score counts up from 0 to final value
- ✅ Skill level badge displays (Beginner/Intermediate/Advanced)
- ✅ 3 strengths with checkmarks
- ✅ 3 improvements with arrows
- ✅ Summary paragraph at bottom
- ✅ Status shows "COMPLETE" in green

### Chat Widget
- ✅ Floating cyan button in bottom-right
- ✅ Opens to show chat panel
- ✅ Welcome message displays
- ✅ Can type and send messages
- ✅ AI responds in 1-2 seconds
- ✅ Quick suggestion buttons work

## 🐛 Troubleshooting

### Problem: AI Evaluation Shows Error
**Solution:**
```bash
# Check if API key is set
echo $GEMINI_API_KEY  # Linux/Mac
echo %GEMINI_API_KEY%  # Windows CMD
$env:GEMINI_API_KEY    # Windows PowerShell

# If empty, add to .env file
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### Problem: Chat Widget Not Appearing
**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify `chat-widget.js` loaded in Network tab
4. Hard refresh (Ctrl+Shift+R)

### Problem: Slow Response Times
**Solution:**
- Check internet connection
- Verify Gemini API quota not exceeded
- Check browser Network tab for delays
- Try again (first request may be slower)

## 📱 Test on Mobile

1. Find your local IP:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Open on mobile:
   ```
   http://YOUR_IP:3000
   ```

3. Test chat widget and evaluation

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add GEMINI_API_KEY
# Paste your API key when prompted

# Deploy
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variable: `GEMINI_API_KEY`
5. Click "Deploy"

## 📊 Verify Deployment

After deploying, test your production URL:

1. **Homepage**: `https://your-app.vercel.app`
2. **Test Page**: `https://your-app.vercel.app/test-ai.html`
3. **Complete a simulation and check evaluation**
4. **Test chat widget on all pages**

## 🎯 Next Steps

### Customize
- Modify prompts in `api/evaluate.js` and `api/chat.js`
- Adjust UI colors in HTML files
- Add more quick suggestions to chat widget
- Customize evaluation criteria

### Monitor
- Check Vercel Analytics for usage
- Monitor Gemini API quota in Google Cloud Console
- Review function logs for errors
- Track response times

### Enhance
- Add more surgical procedures
- Implement user accounts
- Add progress tracking
- Enable multi-language support

## 📚 Documentation

- **Full Documentation**: [AI_INTEGRATION.md](AI_INTEGRATION.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Project Overview**: [README.md](README.md)

## 🆘 Need Help?

1. Check browser console for errors
2. Review [AI_INTEGRATION.md](AI_INTEGRATION.md)
3. Test endpoints with [test-ai.html](test-ai.html)
4. Check Vercel function logs
5. Verify API key is valid

## ✨ Features to Try

### AI Evaluation
- Complete CPR with different BPM rates
- Try cardiac simulation with varying accuracy
- Compare feedback for different skill levels
- Check how AI adapts to different metrics

### Chat Assistant
- Ask about procedure steps
- Request improvement tips
- Inquire about specific techniques
- Test context awareness (different procedures)

### UI/UX
- Test on different screen sizes
- Try dark mode (if browser supports)
- Check animations and transitions
- Test keyboard navigation

---

**You're all set! 🎉**

The SIMETRA AI integration is complete and ready to use. Start training and let the AI help you improve your surgical skills!
