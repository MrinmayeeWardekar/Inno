const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, tutorOnly } = require('../middleware/auth');
const { sendEnrollmentEmail, sendNewEnrollmentToTutorEmail } = require('../services/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(__dirname, '../uploads/videos');
const thumbsDir = path.join(__dirname, '../uploads/thumbnails');
[uploadsDir, videosDir, thumbsDir].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, 'uploads/videos/');
    else cb(null, 'uploads/thumbnails/');
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// Get all approved courses
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'approved' };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(query).populate('tutor', 'name avatar');
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get tutor's own courses — MUST be before /:id
router.get('/tutor/mycourses', protect, tutorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id });
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutor', 'name avatar bio');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create course with thumbnail
router.post('/', protect, tutorOnly, upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, category, price, tags } = req.body;
    const course = await Course.create({
      title, description, category, price: price || 0,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      tutor: req.user._id,
      thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : ''
    });
    try {
      const { sendAdminNewCourseEmail } = require('../services/emailService');
      await sendAdminNewCourseEmail(process.env.GMAIL_USER, req.user.name, title);
    } catch(e) { console.log('Email error:', e.message); }
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add a lesson with video upload
router.post('/:id/lessons', protect, tutorOnly, upload.single('video'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your course' });
    const { title, type, duration } = req.body;
    const lesson = {
      title, type: type || 'video',
      content: req.file ? `/uploads/videos/${req.file.filename}` : req.body.content || '',
      duration: duration || 0,
      order: course.lessons.length + 1
    };
    course.lessons.push(lesson);
    await course.save();
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Enroll in a course
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutor', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.enrolledStudents.includes(req.user._id))
      return res.status(400).json({ message: 'Already enrolled' });
    course.enrolledStudents.push(req.user._id);
    await course.save();
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id },
      $inc: { xp: 50 }
    });
    await Progress.create({ user: req.user._id, course: course._id });
    try { await sendEnrollmentEmail(req.user.email, req.user.name, course.title, course.tutor?.name); } catch(e) { console.log('Email error:', e.message); }
    try {
      const totalEnrollments = course.enrolledStudents.length;
      await sendNewEnrollmentToTutorEmail(course.tutor.email, course.tutor.name, req.user.name, course.title, totalEnrollments);
    } catch(e) { console.log('Email error:', e.message); }
    res.json({ message: 'Enrolled successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a lesson
router.delete('/:id/lessons/:lessonId', protect, tutorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your course' });
    course.lessons = course.lessons.filter(l => l._id.toString() !== req.params.lessonId);
    await course.save();
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete a course
router.delete('/:id', protect, tutorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your course' });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;