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

// Member 2 - submitReview
router.post("/", protect, isBuyer, submitReview);

// Member 2 - getGigReviews
router.get("/gig/:gigId", getGigReviews);

// Member 2 - getFreelancerReviews
router.get("/freelancer/:freelancerId", getFreelancerReviews);

