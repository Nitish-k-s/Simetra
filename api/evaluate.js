// SIMETRA AI Evaluation API — Gemini Integration
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
    const { procedure, metrics } = req.body;

    if (!procedure || !metrics) {
      return res.status(400).json({ error: 'Missing procedure or metrics' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build prompt based on procedure type
    const prompt = buildEvaluationPrompt(procedure, metrics);

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
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.9
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'AI evaluation failed' });
    }

    const data = await geminiResponse.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    // Parse JSON from response
    const evaluation = parseEvaluationResponse(responseText);
    return res.status(200).json(evaluation);

  } catch (error) {
    console.error('Evaluation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function buildEvaluationPrompt(procedure, metrics) {
  const metricsJson = JSON.stringify(metrics, null, 2);
  
  return `You are an AI evaluator for a surgical training simulator called SIMETRA.

Analyze the following simulation performance metrics and return a JSON response with:
- score: Overall score (0-100)
- skill_level: "Beginner" | "Intermediate" | "Advanced"
- strengths: Array of 3 specific strengths
- improvements: Array of 3 specific improvement suggestions
- summary: A concise 2-3 sentence evaluation summary

Procedure: ${procedure}
Metrics: ${metricsJson}

Evaluation criteria:
- For CPR: Focus on BPM consistency (100-120 optimal), rhythm accuracy, and compression count
- For Cardiac procedures: Focus on accuracy, reaction time, stability, and decision quality
- Be specific and actionable in feedback
- Keep responses professional and concise

Return ONLY valid JSON in this exact format:
{
  "score": <number>,
  "skill_level": "<Beginner|Intermediate|Advanced>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "summary": "<2-3 sentence summary>"
}`;
}

function parseEvaluationResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleaned);
    
    // Validate structure
    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      skill_level: parsed.skill_level || 'Beginner',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
      summary: parsed.summary || 'Evaluation complete.'
    };
  } catch (error) {
    console.error('Parse error:', error);
    // Fallback response
    return {
      score: 70,
      skill_level: 'Intermediate',
      strengths: ['Completed the procedure', 'Followed basic protocol', 'Maintained focus'],
      improvements: ['Improve timing accuracy', 'Enhance precision', 'Practice consistency'],
      summary: 'Good effort. Continue practicing to improve your skills.'
    };
  }
}
