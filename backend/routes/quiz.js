const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect, tutorOnly } = require('../middleware/auth');

// Create quiz
router.post('/', protect, tutorOnly, async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, tutor: req.user._id });
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get quizzes for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Submit quiz answers
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const { answers } = req.body;
    let score = 0;
    let totalPoints = 0;
    const results = quiz.questions.map((q, i) => {
      totalPoints += q.points;
      const correct = answers[i] === q.correctAnswer;
      if (correct) score += q.points;
      return { correct, correctAnswer: q.correctAnswer, yourAnswer: answers[i] };
    });
    const xpEarned = score;
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });
    res.json({ score, totalPoints, xpEarned, results, percentage: Math.round((score / totalPoints) * 100) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;