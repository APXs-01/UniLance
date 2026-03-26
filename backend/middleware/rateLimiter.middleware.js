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
module.exports = { apiLimiter, authLimiter, otpLimiter };
