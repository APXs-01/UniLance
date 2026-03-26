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