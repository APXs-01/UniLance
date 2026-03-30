// Member 1 - Payment Routes (Stripe, Transactions, Discounts, PDF Export)
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  finalizePayment,
  verifyPaymentOTP,
  stripeWebhook,
  releasePayment,
  getTransactionHistory,
  exportTransactionsPDF,
  getPaymentSlip,
  validateDiscountCode,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");
const { paymentLimiter } = require("../middleware/rateLimiter.middleware");

// Member 1 - stripeWebhookHandler (raw body required for Stripe signature verification)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Member 1 - createStripePaymentIntent
router.post("/create-intent", protect, paymentLimiter, createPaymentIntent);

// Member 1 - finalizePayment after Stripe card confirmation
router.post("/finalize", protect, finalizePayment);

// Member 1 - verifyPaymentOTPAndConfirm
router.post("/verify-otp", protect, verifyPaymentOTP);

// Member 1 - releasePaymentToFreelancer
router.post("/release/:orderId", protect, releasePayment);

// Member 1 - getTransactionHistory
router.get("/transactions", protect, getTransactionHistory);

// Member 1 - exportTransactionHistoryPDF
router.get("/transactions/export", protect, exportTransactionsPDF);

// Member 1 - getPaymentSlipPDF
router.get("/slip/:transactionId", protect, getPaymentSlip);

// Member 1 - validateDiscountCode
router.post("/discount/validate", protect, validateDiscountCode);

module.exports = router;

