// Member 4 - User Model (Auth, Profile, SmartQuest)
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  startTime: String, // e.g. "09:00"
  endTime: String,   // e.g. "17:00"
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Expert"],
    default: "Beginner",
  },
  verified: { type: Boolean, default: false },
  verifiedBadgeTitle: { type: String, default: "" }, // e.g. "Certified Security Analyst"
  verifiedAt: { type: Date },
});

const userSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ─── Role ─────────────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["freelancer", "buyer", "admin"],
      required: true,
    },

     // ─── Email Verification (Member 4) ────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);