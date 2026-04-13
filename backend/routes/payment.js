const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// Create order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.price === 0) {
      return res.status(400).json({ message: 'This is a free course - use enroll directly' });
    }

    const options = {
      amount: course.price * 100, // paise
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
      notes: { courseId: courseId.toString(), userId: req.user._id.toString() }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseName: course.title,
      coursePrice: course.price,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment + enroll
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSig !== razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Enroll learner
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const alreadyEnrolled = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!alreadyEnrolled) {
      await Progress.create({ user: req.user._id, course: courseId, completedLessons: [], xpEarned: 0, percentComplete: 0 });
      await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } });

      // Notify tutor earnings
      const tutor = await User.findById(course.tutor);
      if (tutor) {
        const tutorCut = course.price * 0.8;
        await User.findByIdAndUpdate(course.tutor, { $inc: { earnings: tutorCut } });
      }
    }

    res.json({
      success: true,
      message: 'Payment successful! You are now enrolled.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Demo payment (for testing without real Razorpay)
router.post('/demo-enroll', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const alreadyEnrolled = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!alreadyEnrolled) {
      await Progress.create({ user: req.user._id, course: courseId, completedLessons: [], xpEarned: 0, percentComplete: 0 });
      await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } });
    }

    res.json({
      success: true,
      message: 'Demo payment successful! Enrolled.',
      paymentId: `demo_${Date.now()}`,
      orderId: `demo_order_${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
