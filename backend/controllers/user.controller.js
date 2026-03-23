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

// ─── Member 4 - Update Profile ────────────────────────────────────────────────
// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, location, portfolioTheme } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) { user.bio = bio; user.profileCompletionSteps.bio = !!bio; }
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (portfolioTheme) user.portfolioTheme = portfolioTheme;

    // Update basic info completion
    if (user.name && user.phone && user.location) {
      user.profileCompletionSteps.basicInfo = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...user.toObject(),
        profileCompletion: user.getProfileCompletion(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Update Profile Picture ───────────────────────────────────────
// PUT /api/users/profile/picture
const updateProfilePicture = async (req, res) => {
  try {
    const { imageUrl } = req.body; // URL from upload service

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePicture: imageUrl,
        "profileCompletionSteps.profilePicture": true,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile picture updated.",
      profilePicture: user.profilePicture,
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Add / Update Skill ───────────────────────────────────────────
// POST /api/users/skills
const addSkill = async (req, res) => {
  try {
    const { name, proficiency } = req.body;

    if (!name || !proficiency) {
      return res.status(400).json({ success: false, message: "Skill name and proficiency are required." });
    }

    const user = await User.findById(req.user._id);

    // Avoid duplicate skill names
    const existingSkill = user.skills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      existingSkill.proficiency = proficiency;
    } else {
      user.skills.push({ name, proficiency });
    }

    if (user.skills.length > 0) {
      user.profileCompletionSteps.skills = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Skill added/updated.",
      skills: user.skills,
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Remove Skill ──────────────────────────────────────────────────
// DELETE /api/users/skills/:skillId
const removeSkill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skills = user.skills.filter(
      (s) => s._id.toString() !== req.params.skillId
    );
    if (user.skills.length === 0) user.profileCompletionSteps.skills = false;
    await user.save();

    res.status(200).json({ success: true, message: "Skill removed.", skills: user.skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Update Availability Schedule ─────────────────────────────────
// PUT /api/users/availability
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body; // array of { day, startTime, endTime }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        availability,
        "profileCompletionSteps.availability": availability && availability.length > 0,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Availability updated.",
      availability: user.availability,
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Get Freelancer Analytics Dashboard ────────────────────────────
// GET /api/users/analytics
const getFreelancerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Only freelancers can view analytics." });
    }

    const user = await User.findById(req.user._id).select("profileViews totalOrdersCompleted skills walletBalance");
    const badges = await Badge.find({ user: req.user._id });
    const gigs = await Gig.find({ freelancer: req.user._id });

    const totalGigs = gigs.length;
    const activeGigs = gigs.filter((g) => g.isActive).length;
    const avgRating =
      gigs.length > 0
        ? gigs.reduce((sum, g) => sum + g.averageRating, 0) / gigs.length
        : 0;

    res.status(200).json({
      success: true,
      analytics: {
        profileViews: user.profileViews,
        totalOrdersCompleted: user.totalOrdersCompleted,
        walletBalance: user.walletBalance,
        totalBadges: badges.length,
        verifiedSkills: user.skills.filter((s) => s.verified).length,
        totalSkills: user.skills.length,
        totalGigs,
        activeGigs,
        averageRating: parseFloat(avgRating.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Export Portfolio as PDF ──────────────────────────────────────
// GET /api/users/portfolio/export
const exportPortfolioPDF = async (req, res) => {
  try {
    const { generatePortfolioPDF } = require("../utils/pdfService");

    const user = await User.findById(req.user._id).select("-password");
    const badges = await Badge.find({ user: req.user._id });

    const pdfBuffer = await generatePortfolioPDF(user, badges);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="UniLance_Portfolio_${user.name.replace(/\s+/g, "_")}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 4 - Get all freelancers (for buyers browsing) ────────────────────
// GET /api/users/freelancers
const getFreelancers = async (req, res) => {
  try {
    const { skill, university, page = 1, limit = 12 } = req.query;
    const query = { role: "freelancer", isActive: true, isEmailVerified: true };

    if (skill) query["skills.name"] = { $regex: skill, $options: "i" };
    if (university) query.university = { $regex: university, $options: "i" };

    const total = await User.countDocuments(query);
    const freelancers = await User.find(query)
      .select("name profilePicture university skills availability totalOrdersCompleted portfolioSlug portfolioTheme")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ totalOrdersCompleted: -1 });

    res.status(200).json({
      success: true,
      freelancers,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicProfile,
  updateProfile,
  updateProfilePicture,
  addSkill,
  removeSkill,
  updateAvailability,
  getFreelancerAnalytics,
  exportPortfolioPDF,
  getFreelancers,
};
