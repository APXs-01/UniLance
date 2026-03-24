// Member 3 - Gig Routes (Freelancer Services, GitHub Integration, Browse & Filter)
const express = require("express");
const router = express.Router();
const {
  createGig,
  updateGig,
  deleteGig,
  getGig,
  getGigs,
  getMyGigs,
} = require("../controllers/gig.controller");
const { protect, optionalAuth } = require("../middleware/auth.middleware");
const { isFreelancer } = require("../middleware/role.middleware");

// Member 3 - browseGigs (public, with search & filters)
router.get("/", optionalAuth, getGigs);

// Member 3 - getMyGigs (freelancer's own)
router.get("/my-gigs", protect, isFreelancer, getMyGigs);

// Member 3 - getGigById (public + GitHub repo data)
router.get("/:gigId", optionalAuth, getGig);

// Member 3 - createGig (with GitHub repo link)
router.post("/", protect, isFreelancer, createGig);

// Member 3 - updateGig
router.put("/:gigId", protect, isFreelancer, updateGig);

// Member 3 - deleteGig
router.delete("/:gigId", protect, deleteGig);

module.exports = router;
