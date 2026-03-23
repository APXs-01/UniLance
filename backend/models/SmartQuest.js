// Member 4 - SmartQuest Model (AI Skill Validation System)
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       [{ type: String }], // 4 options A, B, C, D
  correctAnswer: { type: String, required: true }, // index "0","1","2","3"
});

const smartQuestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillCategory: {
      type: String,
      enum: [
        "Graphic Design",
        "Full Stack Web Development",
        "Cyber Security",
        "Data Science",
        "Business Analysis",
        "Custom",
      ],
      required: true,
    },
    customSkill: { type: String, default: "" }, // when skillCategory = "Custom"

    // ─── Questions (AI-generated via Gemini) ──────────────────────────────────
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 10 },

    // ─── Session ──────────────────────────────────────────────────────────────
    startedAt:   { type: Date },
    submittedAt: { type: Date },
    durationMinutes: { type: Number, default: 30 }, // 30-minute timer

    // ─── Results ──────────────────────────────────────────────────────────────
    userAnswers:  [{ type: String }], // indices of selected options
    score:        { type: Number, default: 0 }, // percentage
    passed:       { type: Boolean, default: false }, // 80% pass mark
    badgeAwarded: { type: Boolean, default: false },
    badgeTitle:   { type: String, default: "" }, // "Certified Security Analyst"

    // ─── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "expired"],
      default: "pending",
    },

    // ─── Attempt Number (max 2 per 24h) ──────────────────────────────────────
    attemptNumber: { type: Number, default: 1 },
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("SmartQuest", smartQuestSchema);
