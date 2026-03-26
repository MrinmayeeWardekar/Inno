// ============================================================
// recommendations.js (route)
// Drop into: backend/routes/recommendations.js
// Then add in your main app.js or server.js:
//   const recommendRoutes = require("./routes/recommendations");
//   app.use("/api/recommendations", recommendRoutes);
// ============================================================

const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../utils/recommendationEngine");
const { protect } = require("../middleware/auth"); // your existing JWT middleware

// GET /api/recommendations
// Protected — learner must be logged in
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id; // set by your authMiddleware
    const limit = parseInt(req.query.limit) || 6;

    const recommendations = await getRecommendations(userId, limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch recommendations",
    });
  }
});

module.exports = router;