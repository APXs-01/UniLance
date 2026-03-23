// Member 2 - Order Model (Project Order Management)
const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  message:      { type: String, default: "" },
  attachments:  [{ type: String }], // file URLs
  submittedAt:  { type: Date, default: Date.now },
  revisionNote: { type: String, default: "" }, // buyer rejection reason
});