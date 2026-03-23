// Member 4 - OTP Model (Email & Transaction Verification)
// Member 1 - Also used for payment/transaction OTP verification
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, lowercase: true },
    otp:       { type: String, required: true },
    type: {
      type: String,
      enum: [
        "email_verification",   // Member 4 - account registration
        "login_otp",            // Member 4 - 2FA login
        "password_reset",       // Member 4 - password reset
       
      ],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    isUsed:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
