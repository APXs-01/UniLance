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


module.exports = {  };
