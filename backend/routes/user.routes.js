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