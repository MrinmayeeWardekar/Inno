const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are Sage, the AI learning assistant for InnoVenture — a gamified peer-to-peer learning platform for students aged 16+. You are friendly, encouraging, and expert at helping learners and tutors.

For LEARNERS help with: finding courses, explaining concepts simply, study tips, motivation, understanding XP/levels/badges, quiz preparation.
For TUTORS help with: creating engaging content, best teaching practices, attracting students, structuring lessons, pricing advice.

Keep responses concise (2-4 sentences), warm, and actionable. Use emojis occasionally. Stay focused on education and learning topics.`;

router.post('/chat', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: lastMessage }] }
          ],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ message: data.error.message });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond. Try again!";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;