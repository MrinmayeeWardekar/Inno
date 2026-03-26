const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['learner', 'tutor', 'admin'], default: 'learner' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  tutorStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  earnings: { type: Number, default: 0 },
  isSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);