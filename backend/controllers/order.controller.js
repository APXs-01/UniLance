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

// ─── Member 2 - Freelancer Accept/Reject Order ───────────────────────────────
// PUT /api/orders/:orderId/respond
const respondToOrder = async (req, res) => {
  try {
    const { response, reason } = req.body; // "accepted" or "rejected"

    const order = await Order.findById(req.params.orderId)
      .populate("buyer", "name email")
      .populate("gig", "title");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Cannot respond to unpaid orders." });
    }

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ success: false, message: "Response must be accepted or rejected." });
    }

    order.freelancerResponse = response;

    if (response === "accepted") {
      order.status = "in_progress";
      order.acceptedAt = new Date();
      await notifyOrderAccepted(order.buyer._id, order._id, order.orderNumber);
      await sendOrderStatusEmail(order.buyer.email, order.buyer.name, {
        orderNumber: order.orderNumber,
        status: "In Progress",
        message: `Your order for "${order.gig.title}" has been accepted and is now in progress.`,
      });
    } else {
      order.status = "cancelled";
      order.rejectionReason = reason || "";
      order.cancelledAt = new Date();
      // Refund should be triggered here via payment controller
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${response} successfully.`,
      orderStatus: order.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


    
    
