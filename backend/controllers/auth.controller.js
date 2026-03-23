// Member 4 - Auth Controller (Registration, Login, Email Verification, OTP, Password Reset)
const User = require("../models/User");
const { generateToken } = require("../utils/tokenService");
const { createOTP, verifyOTP } = require("../utils/otpService");
const {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
} = require("../utils/emailService");
const { validateUniversityEmail, getUniversityName } = require("../utils/universityEmailValidator");

// ─── Member 4 - Register User ─────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!["freelancer", "buyer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be freelancer or buyer." });
    }

     // ─── Member 4 - Sri Lankan University Email Validation for Freelancers ───
    if (role === "freelancer") {
      const validation = validateUniversityEmail(email);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const university = role === "freelancer" ? getUniversityName(email) : "";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      university,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};