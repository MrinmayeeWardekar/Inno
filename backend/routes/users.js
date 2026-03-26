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
      .sort({ xp: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my progress (enrolled courses + completion)
router.get('/progress', protect, async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.user._id })
      .populate('course', 'title category description thumbnail tutor price');
    res.json(progressList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET earnings (tutor only)
router.get('/earnings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Tutors only' });
    }
    const courses = await Course.find({ tutor: req.user._id, status: 'approved' })
      .select('title price enrolledStudents');

    let totalRevenue = 0;
    const courseBreakdown = courses.map(c => {
      const students = c.enrolledStudents?.length || 0;
      const revenue = students * (c.price || 0);
      totalRevenue += revenue;
      return {
        title: c.title,
        price: c.price,
        students,
        revenue,
        tutorEarnings: revenue * 0.8,
      };
    });

    const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);

    res.json({
      totalRevenue,
      tutorEarnings: totalRevenue * 0.8,
      platformCut: totalRevenue * 0.2,
      totalStudents,
      courses: courseBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE profile (name, bio, avatar)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;