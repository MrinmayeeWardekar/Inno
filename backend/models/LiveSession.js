const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  roomId: { type: String, unique: true },
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);