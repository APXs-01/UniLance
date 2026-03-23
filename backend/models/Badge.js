// Member 2 - Badge Model (Automated Badge Awarding)
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    },
  { timestamps: true }
);