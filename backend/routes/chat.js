const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const SYSTEM_PROMPT = `You are Sage, the AI learning assistant for InnoVenture — a gamified peer-to-peer learning platform. You are friendly, encouraging, and expert at helping learners and tutors.

For LEARNERS you help with:
- Finding the right courses to take
- Explaining difficult concepts in simple terms
- Study tips and learning strategies
- Motivation and accountability
- Understanding XP, levels, badges and the gamification system
- Quiz preparation

For TUTORS you help with:
- Creating engaging course content
- Best practices for teaching online
- Tips to attract more students
- How to structure lessons and quizzes
- Pricing advice for courses

Keep responses concise (2-4 sentences), warm, and actionable. Use emojis occasionally. If asked about something outside education/learning, gently redirect back to InnoVenture topics.`;

router.post('/', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm having trouble responding right now. Try again!";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Something went wrong. Please try again!" });
  }
});

module.exports = router;