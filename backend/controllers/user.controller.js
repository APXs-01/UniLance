// Member 4 - User Controller (Profile Management, Skills, Availability, Analytics, Portfolio)
const User = require("../models/User");
const Badge = require("../models/Badge");
const Gig = require("../models/Gig");


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
