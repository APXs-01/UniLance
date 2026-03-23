// Member 4 - SmartQuest Controller (AI Skill Validation using Gemini API)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SmartQuest = require("../models/SmartQuest");
const User = require("../models/User");
const Badge = require("../models/Badge");
const { sendSmartQuestResultEmail } = require("../utils/emailService");
const { notifySmartQuestPassed } = require("../utils/notificationHelper");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Badge title map by skill category ───────────────────────────────────────
const BADGE_TITLES = {
  "Graphic Design":              "Certified Graphic Designer",
  "Full Stack Web Development":  "Certified Full Stack Developer",
  "Cyber Security":              "Certified Security Analyst",
  "Data Science":                "Certified Data Scientist",
  "Business Analysis":           "Certified Business Analyst",
  "Custom":                      "Certified Specialist",
};
