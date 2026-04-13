const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// GET leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['learner', 'tutor'] } })
      .select('name xp level badges role')
      .sort({ xp: -1 }).limit(50);
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my progress
router.get('/progress', protect, async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('course', 'title category description thumbnail tutor price');
    res.json(progressList);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET earnings (tutor)
router.get('/earnings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Tutors only' });
    const courses = await Course.find({ tutor: req.user._id, status: 'approved' }).select('title price enrolledStudents');
    let totalRevenue = 0;
    const courseBreakdown = courses.map(c => {
      const students = c.enrolledStudents?.length || 0;
      const revenue = students * (c.price || 0);
      totalRevenue += revenue;
      return { title: c.title, price: c.price, students, revenue, tutorEarnings: revenue * 0.8 };
    });
    res.json({
      totalRevenue, tutorEarnings: totalRevenue * 0.8, platformCut: totalRevenue * 0.2,
      totalStudents: courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0),
      courses: courseBreakdown
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET public tutor profile
router.get('/tutor/:id', async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id).select('name bio avatar linkedIn location expertise tutorStatus role xp level badges createdAt');
    if (!tutor || tutor.role !== 'tutor') return res.status(404).json({ message: 'Tutor not found' });
    const courses = await Course.find({ tutor: req.params.id, status: 'approved' }).select('title category price enrolledStudents thumbnail');
    const totalStudents = courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0);
    res.json({ ...tutor.toObject(), courses, totalStudents, totalCourses: courses.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, linkedIn, location, expertise } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (location !== undefined) updates.location = location;
    if (expertise !== undefined) updates.expertise = expertise;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CHANGE password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be 8+ characters' });
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
