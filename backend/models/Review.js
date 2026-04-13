const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  teachingRating: { type: Number, min: 1, max: 5, default: 5 },
  clarityRating: { type: Number, min: 1, max: 5, default: 5 },
  valueRating: { type: Number, min: 1, max: 5, default: 5 },
  review: { type: String, required: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

// One review per learner per course
reviewSchema.index({ course: 1, learner: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
