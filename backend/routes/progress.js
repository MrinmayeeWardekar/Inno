const express = require('express');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const XP_PER_LESSON = 10;
const XP_PER_LEVEL = 100;
const calculateLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

// POST /api/progress/complete-lesson - Mark lesson as complete and add XP
router.post('/complete-lesson', protect, async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.body;
    const lessonIdx = typeof lessonIndex === 'number' ? lessonIndex : parseInt(lessonIndex, 10);
    if (!courseId || lessonIdx === undefined || isNaN(lessonIdx)) {
      return res.status(400).json({ success: false, message: 'Course ID and lesson index required' });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (lessonIdx < 0 || lessonIdx >= course.lessons.length) {
      return res.status(400).json({ success: false, message: 'Invalid lesson index' });
    }
    if (!course.enrolledStudents.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        completedLessons: [],
        percentComplete: 0,
        xpEarned: 0,
      });
    }
    if (progress.completedLessons.includes(lessonIdx)) {
      return res.json({ success: true, message: 'Lesson already completed', progress });
    }
    progress.completedLessons.push(lessonIdx);
    progress.xpEarned += XP_PER_LESSON;
    progress.percentComplete = Math.round((progress.completedLessons.length / course.lessons.length) * 100);
    progress.lastAccessed = new Date();
    await progress.save();
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { xp: XP_PER_LESSON } },
      { new: true }
    );
    const newLevel = calculateLevel(user.xp);
    if (newLevel > user.level) {
      await User.findByIdAndUpdate(req.user._id, { level: newLevel });
    }
    res.json({
      success: true,
      progress,
      xpEarned: XP_PER_LESSON,
      totalXp: user.xp,
      level: newLevel > user.level ? newLevel : user.level,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
