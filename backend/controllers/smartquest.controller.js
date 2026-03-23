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

// ─── Member 4 - Check SmartQuest Attempt Eligibility (max 2 per 24h) ─────────
const checkAttemptEligibility = async (userId, skillCategory) => {
  const user = await User.findById(userId).select("smartQuestAttempts");
  const now = new Date();
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);

  const recentAttempts = user.smartQuestAttempts.filter(
    (a) =>
      a.skill === skillCategory && new Date(a.attemptDate) > yesterday
  );

  return {
    eligible: recentAttempts.length < 2,
    attemptsUsed: recentAttempts.length,
    remainingAttempts: Math.max(0, 2 - recentAttempts.length),
  };
};
