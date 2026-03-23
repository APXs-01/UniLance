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

    // ─── Profile (Member 4) ───────────────────────────────────────────────────
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    university: { type: String, default: "" }, // Freelancers only
    portfolioTheme: { type: String, enum: ["Dark", "Light"], default: "Light" },
    portfolioSlug: { type: String, unique: true, sparse: true }, // auto-generated shareable link

     // ─── Profile Completion (Member 4) ───────────────────────────────────────
    profileCompletionSteps: {
      basicInfo:        { type: Boolean, default: false },
      profilePicture:   { type: Boolean, default: false },
      skills:           { type: Boolean, default: false },
      availability:     { type: Boolean, default: false },
      bio:              { type: Boolean, default: false },
    },

    // ─── Skills & Availability (Member 4) ────────────────────────────────────
    skills: [skillSchema],
    availability: [availabilitySlotSchema],

    // ─── Freelancer Analytics (Member 4) ─────────────────────────────────────
    profileViews: { type: Number, default: 0 },
    totalOrdersCompleted: { type: Number, default: 0 },


    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);