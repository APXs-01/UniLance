// Member 3 - Community Routes (Join/Leave, Chat, File Sharing, Flagging, Admin Moderation)
const express = require("express");
const router = express.Router();
const {
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  sendMessage,
  getMessages,
  flagMember,
  adminRemoveMember,
  adminDeleteMessage,
} = require("../controllers/community.controller");
const { protect } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

// Member 3 - getAllCommunities
router.get("/", getCommunities);

// Member 3 - getCommunityById
router.get("/:communityId", protect, getCommunity);

// Member 3 - joinCommunity
router.post("/:communityId/join", protect, joinCommunity);

// Member 3 - leaveCommunity
router.delete("/:communityId/leave", protect, leaveCommunity);

// Member 3 - sendCommunityMessage (text/file)
router.post("/:communityId/messages", protect, sendMessage);

// Member 3 - getCommunityMessages
router.get("/:communityId/messages", protect, getMessages);

// Member 3 - flagUnresponsiveMember
router.post("/:communityId/flag-member", protect, flagMember);

// Member 3 - adminRemoveCommunityMember
router.delete("/admin/:communityId/remove-member", protect, isAdmin, adminRemoveMember);

// Member 3 - adminDeleteCommunityMessage
router.delete("/admin/messages/:messageId", protect, isAdmin, adminDeleteMessage);

module.exports = router;
