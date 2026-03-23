// Member 1 - PayoutRequest Model (Freelancer Withdrawal System)
const mongoose = require("mongoose");

const payoutRequestSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
       // ─── Payout Details  ──────────────
    amount:   { type: Number, required: true, min: 1 },
    currency: { type: String, default: "usd" },
    method: {
      type: String,
      enum: ["stripe", "bank_transfer"],
      default: "stripe",
    },
    stripeAccountId: { type: String, default: "" },
    bankDetails: {
      bankName:      { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      routingNumber: { type: String, default: "" },
    },
     // ─── Status (Member 1) ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "otp_verified", "approved", "processing", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);