// Member 3 - Gig Model (Freelancer Service Listings)
const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Gig Details ──────────────────────────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Graphic Design",
        "Full Stack Web Development",
        "Cyber Security",
        "Data Science",
        "Business Analysis",
      ],
      required: true,
    },
    tags:   [{ type: String }],
    price:  { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },

    // ─── GitHub Integration (Member 3) ───────────────────────────────────────
    // Projects are saved to GitHub, not directly in DB
    githubRepoUrl:  { type: String, default: "" }, // linked GitHub repo
    githubUsername: { type: String, default: "" },

    // ─── Media ────────────────────────────────────────────────────────────────
    coverImage: { type: String, default: "" }, // image URL
    gallery:    [{ type: String }],            // additional images

    // ─── Delivery ─────────────────────────────────────────────────────────────
    deliveryDays: { type: Number, required: true, min: 1 },
    revisions:    { type: Number, default: 1 },

    // ─── Stats ────────────────────────────────────────────────────────────────
    totalOrders:    { type: Number, default: 0 },
    averageRating:  { type: Number, default: 0 },
    totalReviews:   { type: Number, default: 0 },

    // ─── Status ───────────────────────────────────────────────────────────────
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Full-text search index
gigSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Gig", gigSchema);
