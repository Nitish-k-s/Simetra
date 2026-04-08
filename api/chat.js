// SIMETRA AI Training Assistant Chat API — Gemini Integration
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, procedure_context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build system instruction with context
    const systemInstruction = buildSystemInstruction(procedure_context);
    const prompt = `${systemInstruction}\n\nUser question: ${message}\n\nProvide a helpful, concise response (max 4 sentences):`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
            topP: 0.95
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'AI chat failed' });
    }

    const data = await geminiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    return res.status(200).json({ reply: reply.trim() });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function buildSystemInstruction(context) {
  const baseInstruction = `You are a surgical training assistant inside SIMETRA, a browser-based simulation platform.

Your role:
- Explain procedure steps clearly
- Help users understand their mistakes
- Provide improvement tips
- Answer questions about CPR, cardiac access, ablation, and tissue repair

Guidelines:
- Keep answers simple and under 4 sentences
- Be encouraging and professional
- Focus on practical training advice
- Do NOT give real medical advice or claim to replace actual medical training
- This is a simulation for educational purposes only`;

  if (context) {
    return `${baseInstruction}\n\nCurrent procedure context: ${context}`;
  }

  return baseInstruction;
}
