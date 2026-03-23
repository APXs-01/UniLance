// Admin Controller - Financial Dashboard & Platform Management
// Member 1 - Admin financial dashboard (revenue, trends, payout summaries)
// Member 2 - Admin order & review management
// Member 3 - Admin community moderation
// Member 4 - Admin user management
const User = require("../models/User");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Gig = require("../models/Gig");
const Community = require("../models/Community");
const PayoutRequest = require("../models/PayoutRequest");
const Badge = require("../models/Badge");
const Discount = require("../models/Discount");

// ─── Member 4 - Admin: Get All Users (with filters) ──────────────────────────
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -smartQuestAttempts")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};