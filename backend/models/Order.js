// Member 2 - Order Model (Project Order Management)
const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  message:      { type: String, default: "" },
  attachments:  [{ type: String }], // file URLs
  submittedAt:  { type: Date, default: Date.now },
  revisionNote: { type: String, default: "" }, // buyer rejection reason
});

const orderSchema = new mongoose.Schema(
  {
    // ─── Parties ──────────────────────────────────────────────────────────────
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

     // ─── Order Details ────────────────────────────────────────────────────────
    orderNumber:    { type: String, unique: true }, // e.g. UNI-20240101-0001
    requirements:   { type: String, default: "" },  // buyer's project requirements
    price:          { type: Number, required: true },
    deliveryDays:   { type: Number, required: true },
    deadline:       { type: Date },

    // ─── Status Tracking (Member 2) ───────────────────────────────────────────
    // Pending → Accepted → In Progress → Delivered → Completed / Cancelled
    status: {
      type: String,
      enum: [
        "pending",      // buyer placed order, awaiting freelancer acceptance
        "accepted",     // freelancer accepted
        "in_progress",  // work started
        "delivered",    // freelancer submitted delivery
        "revision",     // buyer rejected, revision requested
        "completed",    // buyer approved delivery
        "cancelled",    // cancelled by freelancer or admin
        "disputed",     // buyer/freelancer raised a dispute
      ],
      default: "pending",
    },

    // ─── Freelancer Accept/Reject (Member 2) ──────────────────────────────────
    freelancerResponse: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },

    // ─── Delivery (Member 2) ──────────────────────────────────────────────────
    deliveries: [deliverySchema],
    revisionsUsed:   { type: Number, default: 0 },
    maxRevisions:    { type: Number, default: 1 },

    // ─── Review (Member 2) ────────────────────────────────────────────────────
    isReviewed: { type: Boolean, default: false },

    // ─── Timestamps ───────────────────────────────────────────────────────────
    acceptedAt:   { type: Date },
    completedAt:  { type: Date },
    cancelledAt:  { type: Date },
  },
  { timestamps: true }
)

 
