// Member 1 - Payout Routes (Freelancer Withdrawal System)
const express = require("express");
const router = express.Router();
const {
  requestPayout,
  verifyPayoutOTP,
  getPayoutHistory,
  getPendingPayouts,
  approvePayout,
  rejectPayout,
} = require("../controllers/payout.controller");
const { protect } = require("../middleware/auth.middleware");
const { isAdmin, isFreelancer } = require("../middleware/role.middleware");

// Member 1 - requestPayoutWithdrawal
router.post("/request", protect, isFreelancer, requestPayout);

// Member 1 - verifyPayoutOTP
router.post("/verify-otp", protect, isFreelancer, verifyPayoutOTP);

// Member 1 - getFreelancerPayoutHistory
router.get("/history", protect, isFreelancer, getPayoutHistory);

// Member 1 - adminGetPendingPayouts
router.get("/admin/pending", protect, isAdmin, getPendingPayouts);

// Member 1 - adminApprovePayout
router.put("/admin/:payoutRequestId/approve", protect, isAdmin, approvePayout);

// Member 1 - adminRejectPayout
router.put("/admin/:payoutRequestId/reject", protect, isAdmin, rejectPayout);

module.exports = router;
