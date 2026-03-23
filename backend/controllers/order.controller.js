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

// ─── Member 2 - Place Order (Buyer) ──────────────────────────────────────────
// POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const { gigId, requirements } = req.body;

    if (req.user.role !== "buyer") {
      return res.status(403).json({ success: false, message: "Only buyers can place orders." });
    }

    const gig = await Gig.findById(gigId).populate("freelancer", "name email");
    if (!gig || !gig.isActive) {
      return res.status(404).json({ success: false, message: "Gig not found or inactive." });
    }

    if (gig.freelancer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot order your own gig." });
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + gig.deliveryDays);

    const order = await Order.create({
      buyer: req.user._id,
      freelancer: gig.freelancer._id,
      gig: gigId,
      requirements: requirements || "",
      price: gig.price,
      deliveryDays: gig.deliveryDays,
      deadline,
      maxRevisions: gig.revisions,
    });

    // Increment gig order count
    await Gig.findByIdAndUpdate(gigId, { $inc: { totalOrders: 1 } });

     // ─── Member 2 - Notify freelancer of new order ────────────────────────────
    await notifyOrderPlaced(gig.freelancer._id, order._id, order.orderNumber);

    res.status(201).json({
      success: true,
      message: "Order placed successfully. Awaiting payment.",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        price: order.price,
        deadline: order.deadline,
        gigTitle: gig.title,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


    
    
