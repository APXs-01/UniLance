// Member 1 - Notification Model (Real-time Alerts for Payment Events)
// Member 2 - Also used for order status change notifications
// Member 3 - Also used for community/chat notifications
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Notification Content ─────────────────────────────────────────────────
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
       
        // Member 2 - Order events
        "order_placed",
        "order_accepted",
        "order_rejected",
        "order_delivered",
        "order_completed",
        "order_cancelled",
        "revision_requested",
        "badge_awarded",
        "new_review",

        // Member 4 - Auth/profile events
        "smartquest_passed",
        "smartquest_failed",
        "profile_viewed",
      ],
      required: true,
    },

     // ─── Reference Links ──────────────────────────────────────────────────────
    relatedId:   { type: mongoose.Schema.Types.ObjectId }, // order/transaction/etc ID
    relatedModel:{ type: String, default: "" }, // "Order", "Transaction", etc.
    link:        { type: String, default: "" },  // frontend route link

    // ─── Status ───────────────────────────────────────────────────────────────
    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date },
   
  },
  { timestamps: true }
);

// Index for fast unread queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
