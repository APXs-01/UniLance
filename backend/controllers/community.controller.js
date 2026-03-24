// Member 3 - Community Controller (Community Management, Chat, File Sharing, Flagging)
const Community = require("../models/Community");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const { createNotification } = require("../utils/notificationHelper");

// ─── Member 3 - Get All Communities ──────────────────────────────────────────
// GET /api/communities
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ isActive: true })
      .populate("moderators", "name profilePicture")
      .select("-members");

    res.status(200).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Get Single Community (with members) ──────────────────────────
// GET /api/communities/:communityId
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId)
      .populate("members.user", "name profilePicture university skills")
      .populate("moderators", "name profilePicture");

    if (!community || !community.isActive) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    res.status(200).json({ success: true, community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Join Community ────────────────────────────────────────────────
// POST /api/communities/:communityId/join
const joinCommunity = async (req, res) => {
  try {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Only freelancers can join communities." });
    }

    const community = await Community.findById(req.params.communityId);
    if (!community || !community.isActive) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    // Check already a member
    const alreadyMember = community.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: "You are already a member of this community." });
    }

    community.members.push({ user: req.user._id });
    community.totalMembers = community.members.length;
    await community.save();

    // Add to user's communities list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { communities: community._id },
    });

    await createNotification({
      recipient: req.user._id,
      title: `Joined ${community.name}`,
      message: `You have successfully joined the ${community.name} community.`,
      type: "community_joined",
      relatedId: community._id,
      relatedModel: "Community",
      link: `/communities/${community._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully joined ${community.name}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Leave Community ───────────────────────────────────────────────
// DELETE /api/communities/:communityId/leave
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    community.members = community.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );
    community.totalMembers = community.members.length;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { communities: community._id },
    });

    res.status(200).json({ success: true, message: `Left ${community.name}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Send Community Chat Message ───────────────────────────────────
// POST /api/communities/:communityId/messages
const sendMessage = async (req, res) => {
  try {
    const { message, messageType, fileUrl, fileName, fileSize, fileMimeType } = req.body;

    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    // Must be a member to message
    const isMember = community.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You must be a community member to send messages." });
    }

    const chatMsg = await ChatMessage.create({
      community: req.params.communityId,
      sender: req.user._id,
      message: message || "",
      messageType: messageType || "text",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      fileMimeType: fileMimeType || "",
    });

    await community.updateOne({ $inc: { totalMessages: 1 } });

    const populated = await chatMsg.populate("sender", "name profilePicture");

    // Emit via Socket.IO (handled in server.js community room)
    const { setIO } = require("../utils/notificationHelper");
    // Socket.IO emit is handled in server.js community socket events
    // We emit the populated message here via global io if available
    if (global.io) {
      global.io.to(`community_${req.params.communityId}`).emit("new_message", {
        message: populated,
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Get Community Chat Messages (paginated) ──────────────────────
// GET /api/communities/:communityId/messages
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const community = await Community.findById(req.params.communityId).select("members");
    const isMember = community?.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Must be a member to view messages." });
    }

    const total = await ChatMessage.countDocuments({
      community: req.params.communityId,
      isDeleted: false,
    });

    const messages = await ChatMessage.find({
      community: req.params.communityId,
      isDeleted: false,
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // oldest first
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Flag Member as Unresponsive ───────────────────────────────────
// POST /api/communities/:communityId/flag-member
const flagMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    const memberEntry = community.members.find(
      (m) => m.user.toString() === memberId
    );

    if (!memberEntry) {
      return res.status(404).json({ success: false, message: "Member not found in community." });
    }

    memberEntry.flagCount += 1;
    if (memberEntry.flagCount >= 3) {
      memberEntry.isFlagged = true;
      // Also update user's global flag status
      await User.findByIdAndUpdate(memberId, { isFlagged: true });
    }

    await community.save();

    res.status(200).json({
      success: true,
      message: "Member flagged. Admin will review.",
      flagCount: memberEntry.flagCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Admin: Moderate Community (remove member, delete message) ─────
// DELETE /api/communities/admin/:communityId/remove-member
const adminRemoveMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    const community = await Community.findByIdAndUpdate(
      req.params.communityId,
      {
        $pull: { members: { user: memberId } },
        $inc: { totalMembers: -1 },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(memberId, {
      $pull: { communities: req.params.communityId },
    });

    res.status(200).json({ success: true, message: "Member removed from community." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 3 - Admin: Delete a Community Chat Message ───────────────────────
// DELETE /api/communities/admin/messages/:messageId
const adminDeleteMessage = async (req, res) => {
  try {
    await ChatMessage.findByIdAndUpdate(req.params.messageId, { isDeleted: true });
    res.status(200).json({ success: true, message: "Message deleted by admin." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  sendMessage,
  getMessages,
  flagMember,
  adminRemoveMember,
  adminDeleteMessage,
};
