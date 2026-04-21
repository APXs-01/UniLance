// Member 2 - Review Model (Rating & Review System)
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one review per order
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },

     // ─── Multi-criteria Rating (Member 2) ─────────────────────────────────────
    rating: {
      overall:       { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      quality:       { type: Number, min: 1, max: 5 },
      delivery:      { type: Number, min: 1, max: 5 },
      value:         { type: Number, min: 1, max: 5 },
    },
    comment: { type: String, default: "", maxlength: 1000 },

// ─── Freelancer Response ──────────────────────────────────────────────────
    freelancerReply:     { type: String, default: "" },
    freelancerRepliedAt: { type: Date },

    // ─── Admin Moderation (Member 2) ──────────────────────────────────────────
    isDeleted:     { type: Boolean, default: false },   // admin-deleted
    deletedByAdmin:{ type: Boolean, default: false },
    deleteReason:  { type: String, default: "" },

     // ─── Flagging ─────────────────────────────────────────────────────────────
    isFlagged:   { type: Boolean, default: false },
    flagReason:  { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);