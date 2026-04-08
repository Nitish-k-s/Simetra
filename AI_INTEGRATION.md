# SIMETRA AI Integration — Gemini API

## Overview
This document describes the Gemini AI integration into the SIMETRA surgical training simulator.

## Features Implemented

### 1. AI Performance Evaluation
- **Endpoint**: `POST /api/evaluate`
- **Purpose**: Analyzes simulation performance metrics using Gemini AI
- **Input**: Procedure name and performance metrics (accuracy, BPM, reaction time, etc.)
- **Output**: Structured JSON with score, skill level, strengths, improvements, and summary

### 2. AI Training Assistant Chatbot
- **Endpoint**: `POST /api/chat`
- **Purpose**: Provides real-time training assistance and answers user questions
- **Input**: User message and procedure context
- **Output**: Concise, helpful response (max 4 sentences)

## Architecture

### Backend API Routes
Located in `/api/` directory:
- `evaluate.js` - Performance evaluation endpoint
- `chat.js` - Training assistant chat endpoint

Both routes:
- Use Gemini 1.5 Flash model
- Include CORS headers for cross-origin requests
- Handle errors gracefully with fallback responses
- Return responses in under 3 seconds

### Frontend Components

#### Chat Widget (`simetra/chat-widget.js`)
- Floating chat button (bottom-right corner)
- Expandable chat panel with message history
- Quick suggestion buttons
- Auto-detects current procedure for context
- Smooth animations and transitions

#### Evaluation Screen (`simetra/evaluation.html`)
- Automatically calls `/api/evaluate` on page load
- Displays AI-generated feedback:
  - Overall score (0-100)
  - Skill level (Beginner/Intermediate/Advanced)
  - 3 strengths
  - 3 improvement suggestions
  - Evaluation summary
- Loading skeleton while AI processes
- Error handling with fallback display

## Environment Configuration

### Required Environment Variable
```
GEMINI_API_KEY=your_api_key_here
```

The API key is stored in `.env` file and accessed via `process.env.GEMINI_API_KEY` in the serverless functions.

## API Specifications

### POST /api/evaluate

**Request Body:**
```json
{
  "procedure": "CPR",
  "metrics": {
    "accuracy": 87,
    "avg_bpm": 110,
    "rhythm_accuracy": 75,
    "consistency": 70,
    "total_compressions": 60,
    "completion_time": 60
  }
}
```

**Response:**
```json
{
  "score": 82,
  "skill_level": "Intermediate",
  "strengths": [
    "Maintained consistent compression rate",
    "Good overall accuracy",
    "Completed full procedure"
  ],
  "improvements": [
    "Improve rhythm consistency",
    "Reduce variation between compressions",
    "Practice maintaining 100-120 BPM range"
  ],
  "summary": "Good performance overall. Your compression rate was within acceptable range, but rhythm consistency needs improvement. Continue practicing to develop muscle memory for steady timing."
}
```

### POST /api/chat

**Request Body:**
```json
{
  "message": "What is the purpose of ablation?",
  "procedure_context": "Cardiac Electrical Stabilization"
}
```

**Response:**
```json
{
  "reply": "Ablation is used to correct abnormal electrical signals in the heart by targeting and neutralizing faulty nodes that cause irregular heartbeats. In this simulation, you identify the problematic node and apply controlled energy to restore normal rhythm. This is a simplified training version of real cardiac ablation procedures."
}
```

## UI/UX Design

### Chat Widget
- **Position**: Fixed bottom-right corner
- **Colors**: Cyan/teal gradient matching SIMETRA brand (#0891b2)
- **Interactions**:
  - Click floating button to open/close
  - Type message or use quick suggestions
  - Auto-scrolls to latest message
  - Typing indicator during AI response
- **Responsive**: Works on mobile and desktop

### Evaluation Display
- **Layout**: Grid layout with cards for score, strengths, improvements
- **Animations**: Count-up animation for score, fade-in for content
- **Status Indicators**: 
  - Analyzing (amber pulse)
  - Complete (green)
  - Error (red)
- **Styling**: Clean, clinical white design with cyan accents

## Performance Optimizations

1. **Response Time**: Gemini 1.5 Flash model chosen for speed (<3s responses)
2. **Token Limits**: 
   - Evaluation: 800 max output tokens
   - Chat: 300 max output tokens
3. **Stateless**: No database required, all data in sessionStorage
4. **Caching**: Browser caches chat widget script
5. **Error Handling**: Graceful degradation if AI unavailable

## Testing

### Manual Testing Steps

1. **Test AI Evaluation**:
   - Complete a simulation (CPR or Cardiac)
   - Navigate to evaluation page
   - Verify AI section loads with score, strengths, improvements
   - Check that feedback is relevant to performance

2. **Test Chat Widget**:
   - Open any page (index, procedures, simulation, evaluation)
   - Click chat button (bottom-right)
   - Send a test message: "Explain CPR"
   - Verify response is relevant and concise
   - Try quick suggestion buttons

3. **Test Error Handling**:
   - Temporarily remove/corrupt API key
   - Verify error messages display properly
   - Confirm fallback content shows

### API Testing with cURL

```bash
# Test evaluation endpoint
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "procedure": "CPR",
    "metrics": {
      "accuracy": 85,
      "avg_bpm": 115,
      "rhythm_accuracy": 80,
      "consistency": 75,
      "total_compressions": 50,
      "completion_time": 45
    }
  }'

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve my CPR technique?",
    "procedure_context": "CPR"
  }'
```

## Deployment

### Vercel Configuration
The `vercel.json` file is already configured with:
- API routes mapped to `/api/*`
- CORS headers enabled
- Function memory: 256MB
- Max duration: 10 seconds

### Environment Variables
Set in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your API key
3. Deploy

## Future Enhancements

1. **Chat History Persistence**: Save chat history to localStorage
2. **Voice Input**: Add speech-to-text for hands-free questions
3. **Multi-language Support**: Translate responses based on user preference
4. **Advanced Analytics**: Track which questions are most common
5. **Personalized Feedback**: Remember user's past performance for tailored advice
6. **Procedure-Specific Prompts**: More detailed system instructions per procedure

## Troubleshooting

### AI Evaluation Not Loading
- Check browser console for errors
- Verify API key is set in environment
- Check network tab for failed requests
- Ensure sessionStorage has `simResults` data

### Chat Widget Not Appearing
- Verify `chat-widget.js` is loaded (check network tab)
- Check for JavaScript errors in console
- Ensure Material Symbols font is loaded

### Slow Response Times
- Gemini API may be rate-limited
- Check network latency
- Consider upgrading to Gemini Pro for faster responses
- Reduce maxOutputTokens if responses are too long

## Security Considerations

1. **API Key Protection**: Never expose API key in frontend code
2. **Input Validation**: Both endpoints validate required fields
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **CORS**: Configured to allow cross-origin requests (adjust for production)
5. **Content Filtering**: Gemini has built-in safety filters

## License & Credits

- **SIMETRA**: Surgical training simulator
- **Gemini API**: Google's generative AI model
- **Three.js**: 3D rendering engine
- **Tailwind CSS**: Utility-first CSS framework
