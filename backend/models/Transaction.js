// Member 1 - Transaction Model (Payment & Financial Records)
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // ─── Parties ───────
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // ─── Transaction Info (Member 1) ────────
    transactionId: { type: String, unique: true }, // UNI-TXN-xxxxx
    amount:        { type: Number, required: true }, // total in cents
    currency:      { type: String, default: "usd" },
    platformFee:   { type: Number, default: 0 },     // UniLance commission
    freelancerEarnings: { type: Number, default: 0 },

    // ─── Stripe Details (Member 1) ────────────
    stripePaymentIntentId: { type: String, default: "" },
    stripeChargeId:        { type: String, default: "" },

    // ─── Discount / Offers (Member 1) ─────────
    discountCode:   { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },

    // ─── Status (Member 1) ──────────────
    status: {
      type: String,
      enum: [
        "pending",    // payment initiated
        "completed",  // payment successful
        "refunded",   // refund issued
        "failed",     // payment failed
        "released",   // funds released to freelancer after order completion
      ],
      default: "pending",
    },

    // ─── OTP Verification (Member 1) ──────────────────────────────────────────
    otpVerified: { type: Boolean, default: false },

    // ─── Payment Slip (Member 1) ───────────────────────────────────────────────
    slipUrl: { type: String, default: "" }, // generated PDF payment slip URL

    // ─── Notes ────────────────────────────────────────────────────────────────
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate transaction ID
transactionSchema.pre("save", async function (next) {
  if (!this.transactionId) {
    const uid = Math.random().toString(36).substring(2, 9).toUpperCase();
    this.transactionId = `UNI-TXN-${uid}`;
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
