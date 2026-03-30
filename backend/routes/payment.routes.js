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

