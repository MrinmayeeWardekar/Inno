const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// GET all reviews for a course
router.get('/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('learner', 'name avatar')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
    const teachingAvg = total > 0 ? (reviews.reduce((s, r) => s + (r.teachingRating || r.rating), 0) / total).toFixed(1) : 0;
    const clarityAvg = total > 0 ? (reviews.reduce((s, r) => s + (r.clarityRating || r.rating), 0) / total).toFixed(1) : 0;
    const valueAvg = total > 0 ? (reviews.reduce((s, r) => s + (r.valueRating || r.rating), 0) / total).toFixed(1) : 0;

    // Star distribution
    const dist = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
      percent: total > 0 ? Math.round((reviews.filter(r => r.rating === star).length / total) * 100) : 0
    }));

    res.json({ reviews, avg: Number(avg), total, teachingAvg, clarityAvg, valueAvg, dist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a review (must be enrolled)
router.post('/:courseId', protect, async (req, res) => {
  try {
    const { rating, teachingRating, clarityRating, valueRating, review } = req.body;

    if (!rating || !review) {
      return res.status(400).json({ message: 'Rating and review text are required' });
    }

    // Check enrolled
    const enrolled = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
    if (!enrolled) {
      return res.status(403).json({ message: 'You must be enrolled to leave a review' });
    }

    // Check existing
    const existing = await Review.findOne({ course: req.params.courseId, learner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    const newReview = await Review.create({
      course: req.params.courseId,
      learner: req.user._id,
      rating, teachingRating, clarityRating, valueRating, review
    });

    await newReview.populate('learner', 'name avatar');
    res.status(201).json(newReview);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this course' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE own review
router.delete('/:courseId', protect, async (req, res) => {
  try {
    await Review.findOneAndDelete({ course: req.params.courseId, learner: req.user._id });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
