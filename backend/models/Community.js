// Member 3 - Community Model (Student Freelance Communities)
const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    // ─── Community Info ───────────────────────────────────────────────────────
    name: {
      type: String,
      enum: [
        "Graphic Design",
        "Full Stack Web Development",
        "Cyber Security",
        "Data Science",
        "Business Analysis",
      ],
      unique: true,
      required: true,
    },
    description: { type: String, default: "" },
    coverImage:  { type: String, default: "" },
    icon:        { type: String, default: "" },

    // ─── Members ──────────────────────────────────────────────────────────────
    members: [
      {
        user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role:     { type: String, enum: ["member", "moderator"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
        isFlagged:{ type: Boolean, default: false }, // Member 3 - flagging unresponsive members
        flagCount:{ type: Number, default: 0 },
      },
    ],

    // ─── Admin / Moderation (Member 3) ────────────────────────────────────────
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive:   { type: Boolean, default: true },

    // ─── Stats ────────────────────────────────────────────────────────────────
    totalMembers: { type: Number, default: 0 },
    totalMessages:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
