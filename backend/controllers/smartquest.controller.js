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

// ─── Member 4 - Start SmartQuest Session (Generate Questions via Gemini) ──────
// POST /api/smartquest/start
const startSmartQuest = async (req, res) => {
  try {
    const { skillCategory, customSkill, totalQuestions = 10 } = req.body;

    if (!skillCategory) {
      return res.status(400).json({ success: false, message: "Skill category is required." });
    }

    // ─── Check 2-attempt limit per 24h (Member 4) ────────────────────────────
    const eligibility = await checkAttemptEligibility(req.user._id, skillCategory);
    if (!eligibility.eligible) {
      return res.status(429).json({
        success: false,
        message: `You have used ${eligibility.attemptsUsed}/2 attempts for today. Try again in 24 hours.`,
        attemptsUsed: eligibility.attemptsUsed,
      });
    }

    // ─── Check if already passed this skill ───────────────────────────────────
    const user = await User.findById(req.user._id);
    const alreadyVerified = user.skills.find(
      (s) => s.name.toLowerCase() === skillCategory.toLowerCase() && s.verified
    );
    if (alreadyVerified) {
      return res.status(400).json({
        success: false,
        message: `You already have a verified badge for ${skillCategory}.`,
      });
    }

    // ─── Generate MCQ Questions via Gemini API ────────────────────────────────
    const skillName = skillCategory === "Custom" ? customSkill : skillCategory;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate exactly ${totalQuestions} multiple-choice questions for a ${skillName} skill assessment.
      Requirements:
      - Each question must have exactly 4 options (A, B, C, D)
      - Questions should cover core concepts, best practices, and practical scenarios
      - Difficulty: mix of intermediate and advanced level
      - Return ONLY valid JSON array, no markdown, no explanation
      - Format: [{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctAnswer": "0"}]
      - correctAnswer is the INDEX (0, 1, 2, or 3) of the correct option in the options array
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, message: "Failed to generate questions. Please try again." });
    }

    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ success: false, message: "Invalid questions generated. Please try again." });
    }

    // ─── Create SmartQuest session ────────────────────────────────────────────
    const attemptNumber = eligibility.attemptsUsed + 1;
    const quest = await SmartQuest.create({
      user: req.user._id,
      skillCategory,
      customSkill: customSkill || "",
      questions: questions.slice(0, totalQuestions),
      totalQuestions: Math.min(questions.length, totalQuestions),
      startedAt: new Date(),
      attemptNumber,
      status: "in_progress",
    });

    // ─── Log attempt to user (Member 4) ───────────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        smartQuestAttempts: { skill: skillCategory, attemptDate: new Date() },
      },
    });

    // Send questions WITHOUT correct answers to client
    const safeQuestions = quest.questions.map((q, idx) => ({
      index: idx,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({
      success: true,
      message: "SmartQuest session started. You have 30 minutes.",
      questId: quest._id,
      skillCategory,
      totalQuestions: quest.totalQuestions,
      durationMinutes: 30,
      attemptNumber,
      remainingAttempts: eligibility.remainingAttempts - 1,
      questions: safeQuestions,
      startedAt: quest.startedAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
