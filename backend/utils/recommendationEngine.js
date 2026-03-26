// ============================================================
// recommendationEngine.js
// Drop into: backend/utils/recommendationEngine.js
// ============================================================

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");

// -----------------------------------------------------------
// WEIGHTS — must sum to 1.0
// Tweak these as your data grows
// -----------------------------------------------------------
const WEIGHTS = {
  categoryMatch: 0.35,
  collaborative: 0.25,
  rating: 0.15,
  completionRate: 0.10,
  xpLevelMatch: 0.10,
  recency: 0.05,
};

// -----------------------------------------------------------
// Main function — call this from your route
// Returns top N recommended courses for a given learner
// -----------------------------------------------------------
async function getRecommendations(userId, limit = 6) {
  // 1. What has the student already enrolled in?
  const enrollments = await Enrollment.find({ student: userId }).populate("course");
  const enrolledCourseIds = enrollments.map((e) => e.course._id.toString());
  const enrolledCategories = [...new Set(enrollments.map((e) => e.course.category))];

  // 2. What is the student's XP level? (beginner / intermediate / advanced)
  //    Assumes your User model has an `xp` field
  const { User } = require("../models/User");
  const user = await User.findById(userId);
  const userLevel = getXpLevel(user?.xp || 0);

  // 3. Collaborative signal — courses bought by students who share ≥1 category
  const similarStudentEnrollments = await Enrollment.find({
    student: { $ne: userId },
    course: { $exists: true },
  }).populate({
    path: "course",
    match: { category: { $in: enrolledCategories } },
  });

  // Count how many "similar" students enrolled in each course
  const collaborativeCount = {};
  similarStudentEnrollments.forEach((e) => {
    if (!e.course) return;
    const cid = e.course._id.toString();
    if (!enrolledCourseIds.includes(cid)) {
      collaborativeCount[cid] = (collaborativeCount[cid] || 0) + 1;
    }
  });
  const maxCollaborative = Math.max(1, ...Object.values(collaborativeCount));

  // 4. Fetch all courses the student has NOT enrolled in
  const candidates = await Course.find({
    _id: { $nin: enrolledCourseIds },
    isPublished: true,
  }).lean();

  if (!candidates.length) return [];

  // 5. Score every candidate
  const scored = await Promise.all(
    candidates.map(async (course) => {
      const cid = course._id.toString();

      // --- Category signal (0-1) ---
      const categoryScore = enrolledCategories.includes(course.category) ? 1 : 0;

      // --- Collaborative signal (0-1) ---
      const collaborativeScore = (collaborativeCount[cid] || 0) / maxCollaborative;

      // --- Rating signal (0-1), assume rating is 0-5 ---
      const ratingScore = (course.rating || 0) / 5;

      // --- Completion rate signal (0-1) ---
      // Average progress across all students who enrolled in this course
      const allProgress = await Progress.find({ course: cid });
      let completionRate = 0;
      if (allProgress.length) {
        const avgProgress =
          allProgress.reduce((sum, p) => sum + (p.percentage || 0), 0) /
          allProgress.length;
        completionRate = avgProgress / 100;
      }

      // --- XP / Difficulty match signal (0-1) ---
      const levelScore = course.level === userLevel ? 1 : course.level === "beginner" ? 0.6 : 0.2;

      // --- Recency signal (0-1) ---
      // Courses published in the last 30 days get full score, decaying after
      const daysSincePublished =
        (Date.now() - new Date(course.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - daysSincePublished / 30);

      // --- Final weighted score ---
      const finalScore =
        WEIGHTS.categoryMatch * categoryScore +
        WEIGHTS.collaborative * collaborativeScore +
        WEIGHTS.rating * ratingScore +
        WEIGHTS.completionRate * completionRate +
        WEIGHTS.xpLevelMatch * levelScore +
        WEIGHTS.recency * recencyScore;

      return { ...course, _score: parseFloat(finalScore.toFixed(4)) };
    })
  );

  // 6. Sort by score descending, return top N
  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

// -----------------------------------------------------------
// Helper — map XP to difficulty tier
// Adjust thresholds to match your XP system
// -----------------------------------------------------------
function getXpLevel(xp) {
  if (xp < 500) return "beginner";
  if (xp < 2000) return "intermediate";
  return "advanced";
}

module.exports = { getRecommendations };