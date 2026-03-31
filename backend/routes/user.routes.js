// Member 4 - User Routes (Profile, Skills, Availability, Portfolio, Analytics)
const express = require("express");
const router = express.Router();
const {
  getPublicProfile,
  updateProfile,
  updateProfilePicture,
  addSkill,
  removeSkill,
  updateAvailability,
  getFreelancerAnalytics,
  exportPortfolioPDF,
  getFreelancers,
  getPlatformStats,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { isFreelancer } = require("../middleware/role.middleware");

// Public platform stats
router.get("/stats", getPlatformStats);

// Member 4 - getAllFreelancers
router.get("/freelancers", getFreelancers);

// Member 4 - getPublicProfileByIdOrSlug
router.get("/profile/:identifier", getPublicProfile);

// Member 4 - updateUserProfile
router.put("/profile", protect, updateProfile);

// Member 4 - updateProfilePicture
router.put("/profile/picture", protect, updateProfilePicture);

// Member 4 - addOrUpdateSkill
router.post("/skills", protect, isFreelancer, addSkill);

// Member 4 - removeSkill
router.delete("/skills/:skillId", protect, isFreelancer, removeSkill);

// Member 4 - updateAvailabilitySchedule
router.put("/availability", protect, isFreelancer, updateAvailability);

// Member 4 - getFreelancerAnalyticsDashboard
router.get("/analytics", protect, isFreelancer, getFreelancerAnalytics);

// Member 4 - exportPortfolioPDF
router.get("/portfolio/export", protect, exportPortfolioPDF);