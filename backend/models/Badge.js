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
        
        
        "top_rated",      // Member 2 - rating achievement
      ],
      required: true,
    },

    },
  { timestamps: true }
);