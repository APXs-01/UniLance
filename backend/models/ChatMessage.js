// Member 3 - ChatMessage Model (Real-time Community Chat)
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Message Content ──────────────────────────────────────────────────────
    message:  { type: String, default: "" },
    messageType: {
      type: String,
      enum: ["text", "file", "image"],
      default: "text",
    },

    // ─── File Sharing (Member 3) ──────────────────────────────────────────────
    fileUrl:      { type: String, default: "" },
    fileName:     { type: String, default: "" },
    fileSize:     { type: Number, default: 0 },
    fileMimeType: { type: String, default: "" },

    // ─── Read Receipts ────────────────────────────────────────────────────────
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
