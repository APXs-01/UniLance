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

     // ─── Member 4 - Send Email Verification OTP ───────────────────────────────
    const otp = await createOTP(email, "email_verification");
    await sendEmailVerificationOTP(email, otp, name);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      userId: user._id,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Verify Email with OTP ────────────────────────────────────────
// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOTP(email, otp, "email_verification");
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        isEmailVerified: true,
        "profileCompletionSteps.basicInfo": true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        profileCompletion: user.getProfileCompletion(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};