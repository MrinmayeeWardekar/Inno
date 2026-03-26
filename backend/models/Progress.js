const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedLessons: [{
    type: Number, // lesson index in course.lessons array
  }],
  percentComplete: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for unique user-course pair
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
