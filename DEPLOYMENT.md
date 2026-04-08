# SIMETRA Deployment Guide

## Quick Start (Local Development)

1. **Install dependencies** (if any):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - The `.env` file already contains your Gemini API key
   - Verify it's present: `GEMINI_API_KEY=AIzaSy...`

3. **Start local server**:
   ```bash
   npm run dev
   ```
   This will start a local server at `http://localhost:3000`

4. **Test the application**:
   - Open `http://localhost:3000` in your browser
   - Navigate to a simulation (CPR or Cardiac)
   - Complete the simulation
   - Check the evaluation page for AI feedback
   - Click the chat widget (bottom-right) to test the AI assistant

5. **Test API endpoints directly**:
   - Open `http://localhost:3000/test-ai.html`
   - Run the test buttons to verify both endpoints work

## Vercel Deployment

### Prerequisites
- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`

### Deployment Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Set environment variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   Paste your API key when prompted.
   Select: Production, Preview, Development (all three)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Verify deployment**:
   - Vercel will provide a URL (e.g., `simetra.vercel.app`)
   - Open the URL and test the application
   - Check evaluation page and chat widget

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `simetra`
5. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
6. Click "Deploy"

## Environment Variables

### Required
- `GEMINI_API_KEY` - Your Google Gemini API key

### How to Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file or Vercel environment variables

## Troubleshooting

### API Endpoints Not Working
- **Local**: Make sure you're running the server with `npm run dev`
- **Vercel**: Check that environment variables are set in the Vercel dashboard
- **Both**: Verify API key is valid and has quota remaining

### Chat Widget Not Appearing
- Check browser console for JavaScript errors
- Verify `chat-widget.js` is being loaded (Network tab)
- Ensure Material Symbols font is loading

### AI Evaluation Shows Error
- Check that simulation completed and saved data to sessionStorage
- Verify `/api/evaluate` endpoint is accessible
- Check browser console and network tab for errors

### CORS Errors
- Vercel configuration already includes CORS headers
- If testing locally with a different port, you may need to adjust CORS settings

## Testing Checklist

Before deploying to production, verify:

- [ ] CPR simulation completes successfully
- [ ] Cardiac simulation completes successfully
- [ ] Evaluation page loads AI feedback
- [ ] AI score, skill level, strengths, and improvements display
- [ ] Chat widget opens and closes
- [ ] Chat widget responds to messages
- [ ] Quick suggestion buttons work
- [ ] All pages load without errors
- [ ] Mobile responsive design works
- [ ] No console errors

## Performance Monitoring

### Response Times
- Target: < 3 seconds for both endpoints
- Monitor in browser Network tab
- Check Vercel Analytics for function execution times

### API Quota
- Gemini API has rate limits
- Monitor usage in Google Cloud Console
- Consider upgrading to paid tier for production

## Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** for all secrets
3. **Enable rate limiting** in production (consider Vercel Edge Config)
4. **Monitor API usage** to detect abuse
5. **Validate all inputs** on the backend

## Scaling Considerations

### Current Setup (Stateless)
- No database required
- All data in sessionStorage (client-side)
- Serverless functions scale automatically

### Future Enhancements
- Add database for user accounts and progress tracking
- Implement caching for common AI responses
- Add rate limiting per user/IP
- Consider Gemini Pro for higher throughput

## Support

For issues or questions:
1. Check browser console for errors
2. Review `AI_INTEGRATION.md` for detailed documentation
3. Test endpoints with `test-ai.html`
4. Check Vercel function logs in dashboard

## Useful Commands

```bash
# Local development
npm run dev

# Deploy to Vercel
vercel --prod

# Check Vercel logs
vercel logs

# List environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

## File Structure

```
simetra/
├── api/
│   ├── evaluate.js       # AI evaluation endpoint
│   └── chat.js           # AI chat endpoint
├── simetra/
│   ├── *.html            # Application pages
│   ├── chat-widget.js    # Chat widget component
│   ├── sim-core.js       # Simulation engine
│   └── cpr-core.js       # CPR simulation
├── .env                  # Environment variables (local)
├── vercel.json           # Vercel configuration
├── package.json          # Project metadata
├── AI_INTEGRATION.md     # Detailed AI documentation
└── DEPLOYMENT.md         # This file
```
