// Member 4 - SmartQuest Controller (AI Skill Validation using Gemini API)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const SmartQuest = require("../models/SmartQuest");
const User = require("../models/User");
const Badge = require("../models/Badge");
const { sendSmartQuestResultEmail } = require("../utils/emailService");
const { notifySmartQuestPassed } = require("../utils/notificationHelper");


