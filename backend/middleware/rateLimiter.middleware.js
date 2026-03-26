// Member 4 - Rate Limiter Middleware (SmartQuest & API Protection)
const rateLimit = require("express-rate-limit");

// ─── General API rate limiter ──────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Auth endpoints limiter ────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── OTP request limiter ───────────────────────────────────────────────────────
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: { success: false, message: "Too many OTP requests. Please wait 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── SmartQuest limiter (Member 4) - max 2 attempts per 24 hours ──────────────
// NOTE: Per-user limiting is enforced in the controller via DB (smartQuestAttempts field)
// This middleware adds IP-level protection on top
const smartQuestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // IP-level: 5 per 24h (per-user limit of 2 enforced in controller)
  message: { success: false, message: "SmartQuest attempt limit reached. Try again tomorrow." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, otpLimiter, smartQuestLimiter };
