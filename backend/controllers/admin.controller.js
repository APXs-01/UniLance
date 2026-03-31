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

// ─── Member 4 - Admin: Deactivate/Activate User ──────────────────────────────
// PUT /api/admin/users/:userId/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot deactivate admin accounts." });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Platform Overview Stats ──────────────────────────────────────────
// GET /api/admin/dashboard/overview
const getOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers, totalFreelancers, totalBuyers,
      totalOrders, completedOrders, pendingOrders,
      totalGigs, totalCommunityMembers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "freelancer" }),
      User.countDocuments({ role: "buyer" }),
      Order.countDocuments(),
      Order.countDocuments({ status: "completed" }),
      Order.countDocuments({ status: "pending" }),
      Gig.countDocuments({ isActive: true }),
      Community.aggregate([{ $project: { count: { $size: "$members" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFreelancers,
        totalBuyers,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalGigs,
        totalCommunityMemberships: totalCommunityMembers[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Admin: Get All Communities ───────────────────────────────────
// GET /api/admin/communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("moderators", "name email")
      .select("name totalMembers totalMessages isActive");

    res.status(200).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Admin: Toggle Community Status ────────────────────────────────
// PUT /api/admin/communities/:communityId/toggle
const toggleCommunityStatus = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    community.isActive = !community.isActive;
    await community.save();

    res.status(200).json({
      success: true,
      message: `Community ${community.isActive ? "activated" : "deactivated"}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getFinanceDashboard,
  getAllUsers,
  toggleUserStatus,
  getAllOrders,
  getAllCommunities,
  toggleCommunityStatus,
  getFlaggedReviews,
  createDiscount,
  getDiscounts,
  toggleDiscount,
  getOverviewStats,
};
