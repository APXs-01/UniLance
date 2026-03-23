// Member 4 - User Controller (Profile Management, Skills, Availability, Analytics, Portfolio)
const User = require("../models/User");
const Badge = require("../models/Badge");
const Gig = require("../models/Gig");

// ─── Member 4 - Get Public Profile (by userId or portfolioSlug) ───────────────
// GET /api/users/profile/:identifier
const getPublicProfile = async (req, res) => {
  try {
    const { identifier } = req.params;

    const user = await User.findOne({
      $or: [
        { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null },
        { portfolioSlug: identifier },
      ],
      isActive: true,
    }).select("-password -smartQuestAttempts -stripeCustomerId -stripeAccountId -walletBalance");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Increment profile views for freelancers
    if (user.role === "freelancer") {
      await User.findByIdAndUpdate(user._id, { $inc: { profileViews: 1 } });
    }

    const badges = await Badge.find({ user: user._id });
    const gigs = user.role === "freelancer"
      ? await Gig.find({ freelancer: user._id, isActive: true }).limit(6)
      : [];

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        profileCompletion: user.getProfileCompletion(),
      },
      badges,
      gigs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};