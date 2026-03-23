// Member 4 - SmartQuest Model (AI Skill Validation System)
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       [{ type: String }], // 4 options A, B, C, D
  correctAnswer: { type: String, required: true }, // index "0","1","2","3"
});

const smartQuestSchema = new mongoose.Schema(
  {
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("SmartQuest", smartQuestSchema);
