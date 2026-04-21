// Member 2 - Badge Model (Automated Badge Awarding)
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Badge Info (Member 2) ─────────────────────────────────────────────────
    title:       { type: String, required: true },      // e.g. "Rising Star"
    description: { type: String, default: "" },
    icon:        { type: String, default: "" },         // icon URL or emoji key
    type: {
      type: String,
      enum: [
        "milestone",      // Member 2 - order completion milestones
        "skill_verified", // Member 4 - SmartQuest verified badge
        
        "top_rated",      // Member 2 - rating achievement
      ],
      required: true,
    },

   // ─── Milestone Trigger (Member 2) ─────────────────────────────────────────
    triggerValue: { type: Number, default: 0 }, // e.g. 5 orders = "Rising Star"

    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);
