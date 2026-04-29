const express = require('express');
const router = express.Router();
const LiveSession = require('../models/LiveSession');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, tutorOnly } = require('../middleware/auth');
const { sendLiveSessionEmail, sendLiveSessionEndedEmail } = require('../services/emailService');

const generateRoomId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Start live session
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

    // Find all enrolled students
    const tutorCourses = await Course.find({ tutor: req.user._id }).select('enrolledStudents title');
    const studentIds = [...new Set(tutorCourses.flatMap(c => c.enrolledStudents.map(id => id.toString())))];

    // Socket notification — fire immediately
    req.app.get('io').emit('session-started', {
      sessionId: session._id,
      roomId,
      tutorName: req.user.name,
      tutorId: req.user._id,
      title: session.title,
      enrolledStudentIds: studentIds
    });

    // RESPOND IMMEDIATELY — don't wait for emails
    res.status(201).json(populated);

    // Send emails in background AFTER response is sent
    setImmediate(async () => {
      try {
        const students = await User.find({ _id: { $in: studentIds }, _id: { $ne: req.user._id } }).select('name email');
        const sessionTime = new Date().toLocaleString('en-IN', {
          dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
        });

        // Send all emails in parallel instead of one by one
        const results = await Promise.allSettled(
          students.map(student =>
            sendLiveSessionEmail(
              student.email, student.name,
              req.user.name, title || 'Live Session',
              sessionTime, roomId
            )
          )
        );

        const sent = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Live started by ${req.user.name} — notified ${sent}/${students.length} students`);
      } catch (e) {
        console.log('Background email error:', e.message);
      }
    });

  } catch (err) {
    console.error('Live start error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all live sessions
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: 'live' })
      .populate('tutor', 'name avatar')
      .populate('course', 'title');
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// End live session — PUT /:id/end
router.put('/:id/end', protect, async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id, { status: 'ended' }, { new: true }
    ).populate('tutor', 'name email');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    req.app.get('io').to(session.roomId).emit('session-ended', { sessionId: req.params.id });
    req.app.get('io').emit('session-ended', { sessionId: req.params.id });

    // Respond immediately
    res.json(session);

    // End emails in background
    setImmediate(async () => {
      try {
        const tutorCourses = await Course.find({ tutor: session.tutor._id }).select('enrolledStudents');
        const studentIds = [...new Set(tutorCourses.flatMap(c => c.enrolledStudents.map(id => id.toString())))];
        const students = await User.find({ _id: { $in: studentIds } }).select('name email');

        if (sendLiveSessionEndedEmail) {
          await Promise.allSettled(
            students.map(student =>
              sendLiveSessionEndedEmail(
                student.email, student.name,
                session.tutor.name, session.title
              )
            )
          );
        }
      } catch (e) {
        console.log('End session background email error:', e.message);
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Also support POST /end for backwards compatibility
router.post('/end', protect, async (req, res) => {
  try {
    const { roomId } = req.body;
    const session = await LiveSession.findOneAndUpdate(
      { roomId, status: 'live' }, { status: 'ended' }, { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    req.app.get('io').emit('session-ended', { sessionId: session._id });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get session by roomId
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const session = await LiveSession.findOne({ roomId: req.params.roomId })
      .populate('tutor', 'name avatar');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;