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
