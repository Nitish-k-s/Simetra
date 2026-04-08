# SIMETRA — Surgical Precision Training Simulator

![SIMETRA](https://img.shields.io/badge/SIMETRA-AI%20Powered-0891b2?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google)
![Status](https://img.shields.io/badge/Status-Production%20Ready-10b981?style=for-the-badge)

A browser-based surgical training simulator with real-time AI evaluation and training assistance powered by Google Gemini.

## 🎯 Features

### Core Simulations
- **CPR (Cardiopulmonary Resuscitation)** - Rhythm-based compression training
- **Emergency Thoracic Access** - Incision precision and hemorrhage control
- **Cardiac Electrical Stabilization** - Ablation-inspired node targeting
- **Cardiac Tissue Repair** - Multi-step tissue restoration

### AI Integration ✨
- **Performance Evaluation** - Gemini AI analyzes your performance and provides:
  - Overall score (0-100)
  - Skill level assessment (Beginner/Intermediate/Advanced)
  - 3 specific strengths
  - 3 improvement suggestions
  - Detailed evaluation summary

- **Training Assistant Chatbot** - Real-time AI help:
  - Explains procedure steps
  - Answers technique questions
  - Provides improvement tips
  - Context-aware responses based on current procedure

### Technical Features
- 🌐 **Browser-based** - No installation required
- 🎮 **3D Graphics** - Three.js powered realistic rendering
- 📊 **Real-time Metrics** - Track accuracy, timing, and consistency
- 💬 **AI Chat Widget** - Floating assistant on every page
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Stateless** - No database required, uses sessionStorage

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd simetra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   - API key is already in `.env` file
   - Verify: `GEMINI_API_KEY=AIzaSy...`

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Testing

Open the test page to verify AI integration:
```
http://localhost:3000/test-ai.html
```

## 📁 Project Structure

```
simetra/
├── api/                      # Serverless API endpoints
│   ├── evaluate.js          # AI performance evaluation
│   └── chat.js              # AI training assistant
├── simetra/                 # Frontend application
│   ├── index.html           # Landing page
│   ├── procedures.html      # Procedure selection
│   ├── simulation.html      # Cardiac simulation
│   ├── cpr.html             # CPR simulation
│   ├── evaluation.html      # Results with AI feedback
│   ├── instructions.html    # Pre-operative guide
│   ├── chat-widget.js       # AI chat component
│   ├── sim-core.js          # Cardiac simulation engine
│   └── cpr-core.js          # CPR simulation engine
├── .env                     # Environment variables
├── vercel.json              # Vercel configuration
├── package.json             # Project metadata
├── AI_INTEGRATION.md        # Detailed AI documentation
├── DEPLOYMENT.md            # Deployment guide
└── test-ai.html             # API testing page
```

## 🤖 AI Integration

### Evaluation API
```javascript
POST /api/evaluate
{
  "procedure": "CPR",
  "metrics": {
    "accuracy": 85,
    "avg_bpm": 110,
    "rhythm_accuracy": 75,
    "consistency": 70,
    "total_compressions": 60,
    "completion_time": 60
  }
}
```

### Chat API
```javascript
POST /api/chat
{
  "message": "How can I improve my CPR technique?",
  "procedure_context": "CPR"
}
```

See [AI_INTEGRATION.md](AI_INTEGRATION.md) for complete API documentation.

## 🎨 UI/UX

### Design System
- **Colors**: Clinical white with cyan accents (#0891b2)
- **Typography**: Space Grotesk (headings), Inter (body)
- **Style**: Minimal, clean, medical-grade interface
- **Animations**: Smooth transitions, count-up effects, pulse indicators

### Chat Widget
- Fixed bottom-right floating button
- Expandable panel with message history
- Quick suggestion buttons
- Auto-detects current procedure for context

### Evaluation Display
- Grid layout with score, strengths, improvements
- Count-up animation for score
- Status indicators (analyzing/complete/error)
- Responsive cards with hover effects

## 📊 Performance Metrics

Each simulation tracks:
- **Accuracy** - Precision of actions (0-100%)
- **Reaction Time** - Speed of response (seconds)
- **Stability** - Consistency of performance (0-100%)
- **Decision Quality** - Correctness of choices (0-100%)
- **Completion Time** - Total procedure duration (seconds)

## 🔧 Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_api_key_here
```

### Vercel Settings
- Framework: Other
- Build Command: (none)
- Output Directory: `simetra`
- Node Version: 18.x

## 📦 Deployment

### Vercel (Recommended)

1. **Connect repository**
   ```bash
   vercel
   ```

2. **Set environment variable**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

### Manual Testing
1. Complete a simulation (CPR or Cardiac)
2. Check evaluation page for AI feedback
3. Open chat widget and ask questions
4. Verify all metrics display correctly

### API Testing
Use the included test page:
```
http://localhost:3000/test-ai.html
```

Or test with cURL:
```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"procedure":"CPR","metrics":{"accuracy":85}}'
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript
- **3D Engine**: Three.js
- **AI**: Google Gemini 1.5 Flash
- **Deployment**: Vercel Serverless Functions
- **Fonts**: Google Fonts (Space Grotesk, Inter)
- **Icons**: Material Symbols

## 📝 Documentation

- [AI Integration Guide](AI_INTEGRATION.md) - Complete AI documentation
- [Deployment Guide](DEPLOYMENT.md) - Deployment instructions
- [Test Page](test-ai.html) - API testing interface

## 🔒 Security

- API keys stored in environment variables
- CORS configured for cross-origin requests
- Input validation on all endpoints
- Gemini built-in safety filters
- No sensitive data stored client-side

## 🚧 Future Enhancements

- [ ] User accounts and progress tracking
- [ ] Multi-language support
- [ ] Voice input for chat
- [ ] Advanced analytics dashboard
- [ ] More surgical procedures
- [ ] Multiplayer training sessions
- [ ] VR/AR support

## 📄 License

© 2025 SIMETRA CYBERNETICS. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📞 Support

- Check [AI_INTEGRATION.md](AI_INTEGRATION.md) for detailed documentation
- Use [test-ai.html](test-ai.html) to debug API issues
- Review browser console for errors
- Check Vercel function logs for backend issues

---

**Built with ❤️ using Google Gemini AI**
