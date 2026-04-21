// Member 1 - Discount Model (Discount Codes & Offers System)
const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    // ─── Discount Info (Member 1) ─────────────────────────────────────────────
    code:        { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value:    { type: Number, required: true }, // % or fixed amount
    minOrder: { type: Number, default: 0 },     // minimum order amount to apply
    maxUses:  { type: Number, default: null },   // null = unlimited
    usedCount:{ type: Number, default: 0 },

    // ─── Validity ─────────────────────────────────────────────────────────────
    validFrom:  { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive:   { type: Boolean, default: true },

    // ─── Restrictions ─────────────────────────────────────────────────────────
    applicableCategories: [{ type: String }], // empty = all categories
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);