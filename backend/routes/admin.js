const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');
const {
  sendTutorApprovedEmail,
  sendTutorRejectedEmail,
  sendCourseApprovedEmail,
  sendCourseRejectedEmail,
  sendAccountWarnedEmail,
  sendAccountSuspendedEmail,
  sendAdminNewTutorApplicationEmail,
  sendAdminNewCourseEmail
} = require('../services/emailService');

// Get pending tutors
router.get('/tutors/pending', protect, adminOnly, async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor', tutorStatus: 'pending' }).select('-password');
    res.json(tutors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve or reject tutor
router.put('/tutors/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { tutorStatus: status }, { new: true });
    if (status === 'approved') {
      try { await sendTutorApprovedEmail(user.email, user.name); } catch (e) { console.log('Email error:', e.message); }
    } else if (status === 'rejected') {
      try { await sendTutorRejectedEmail(user.email, user.name, reason || 'Did not meet platform requirements'); } catch (e) { console.log('Email error:', e.message); }
    } else if (status === 'warned') {
      try { await sendAccountWarnedEmail(user.email, user.name, reason || 'Violation of platform guidelines'); } catch (e) { console.log('Email error:', e.message); }
    } else if (status === 'suspended') {
      try { await sendAccountSuspendedEmail(user.email, user.name, reason || 'Repeated violations of platform guidelines'); } catch (e) { console.log('Email error:', e.message); }
    }
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get pending courses
router.get('/courses/pending', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find({ status: 'pending' }).populate('tutor', 'name email');
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Approve or reject course
router.put('/courses/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('tutor', 'name email');
    if (status === 'approved') {
      try { await sendCourseApprovedEmail(course.tutor.email, course.tutor.name, course.title); } catch (e) { console.log('Email error:', e.message); }
    } else if (status === 'rejected') {
      try { await sendCourseRejectedEmail(course.tutor.email, course.tutor.name, course.title, reason || 'Did not meet content quality standards'); } catch (e) { console.log('Email error:', e.message); }
    }
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Warn or suspend any user
router.put('/users/:id/action', protect, adminOnly, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (action === 'warn') {
      try { await sendAccountWarnedEmail(user.email, user.name, reason || 'Violation of platform guidelines'); } catch (e) { console.log('Email error:', e.message); }
      await User.findByIdAndUpdate(req.params.id, { warned: true });
    } else if (action === 'suspend') {
      try { await sendAccountSuspendedEmail(user.email, user.name, reason || 'Repeated violations of platform guidelines'); } catch (e) { console.log('Email error:', e.message); }
      await User.findByIdAndUpdate(req.params.id, { isSuspended: true });
    }
    res.json({ message: `User ${action}ed successfully` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalTutors = await User.countDocuments({ role: 'tutor', tutorStatus: 'approved' });
    const totalCourses = await Course.countDocuments({ status: 'approved' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const pendingTutors = await User.countDocuments({ role: 'tutor', tutorStatus: 'pending' });
    res.json({ totalUsers, totalLearners, totalTutors, totalCourses, pendingCourses, pendingTutors });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all courses
router.get('/allcourses', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().populate('tutor', 'name email');
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;