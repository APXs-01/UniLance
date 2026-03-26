// Member 2 - Review Routes (Rating, Multi-criteria Reviews, Admin Moderation)
const express = require("express");
const router = express.Router();
const {
  submitReview,
  getGigReviews,
  getFreelancerReviews,
  replyToReview,
  flagReview,
  adminDeleteReview,
} = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");
const { isBuyer, isAdmin } = require("../middleware/role.middleware");
