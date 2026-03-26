const express = require('express');
const router = express.Router();
const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, tutorOnly } = require('../middleware/auth');
const { sendLiveSessionEmail } = require('../services/emailService');

const generateRoomId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

router.post('/start', protect, tutorOnly, async (req, res) => {
  try {
    const { title, courseId } = req.body;
    const roomId = generateRoomId();

    const session = await LiveSession.create({
      title: title || 'Live Session',
      tutor: req.user._id,
      course: courseId || null,
      roomId,
      status: 'live'
    });

    const populated = await LiveSession.findById(session._id).populate('tutor', 'name avatar');

    // Find all learners enrolled in any of this tutor's courses
    const tutorCourses = await Course.find({ tutor: req.user._id }).select('enrolledStudents title');
    const studentIds = [...new Set(tutorCourses.flatMap(c => c.enrolledStudents.map(id => id.toString())))];
    const students = await User.find({ _id: { $in: studentIds } }).select('name email');

    const sessionTime = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
    });

    // Send real-time socket notification to ALL connected users
    // (frontend filters by enrollment)
    req.app.get('io').emit('session-started', {
      sessionId: session._id,
      roomId,
      tutorName: req.user.name,
      tutorId: req.user._id,
      title: session.title,
      enrolledStudentIds: studentIds
    });

    // Email every enrolled learner
    let emailsSent = 0;
    for (const student of students) {
      try {
        await sendLiveSessionEmail(
          student.email, student.name,
          req.user.name, title || 'Live Session',
          sessionTime, roomId
        );
        emailsSent++;
      } catch(e) { console.log('Email error for', student.email, ':', e.message); }
    }

    console.log(`Live session started by ${req.user.name} — notified ${emailsSent}/${students.length} students`);

    res.status(201).json(populated);
  } catch (err) {
    console.error('Live start error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: 'live' })
      .populate('tutor', 'name avatar')
      .populate('course', 'title');
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/end', protect, async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id, { status: 'ended' }, { new: true }
    );
    req.app.get('io').emit('session-ended', { sessionId: req.params.id });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const session = await LiveSession.findOne({ roomId: req.params.roomId })
      .populate('tutor', 'name avatar');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;