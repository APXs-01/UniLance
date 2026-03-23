// Member 2 - Order Controller (Order Placement, Status Tracking, Delivery Management)
const Order = require("../models/Order");
const Gig = require("../models/Gig");
const User = require("../models/User");
const Badge = require("../models/Badge");
const { sendOrderStatusEmail } = require("../utils/emailService");
const {
  notifyOrderPlaced,
  notifyOrderAccepted,
  notifyOrderDelivered,
  notifyOrderCompleted,
  notifyBadgeAwarded,
} = require("../utils/notificationHelper");


// ─── Badge milestones for freelancers (Member 2) ──────────────────────────────
const BADGE_MILESTONES = [
  { count: 1,   title: "First Order",     description: "Completed your very first order!" },
  { count: 5,   title: "Rising Star",     description: "Completed 5 orders on UniLance." },
  { count: 10,  title: "Skilled Pro",     description: "Completed 10 orders." },
  { count: 25,  title: "Expert Freelancer", description: "Completed 25 orders." },
  { count: 50,  title: "Elite Talent",    description: "Completed 50 orders." },
  { count: 100, title: "UniLance Legend", description: "Completed 100 orders. Legendary!" },
];