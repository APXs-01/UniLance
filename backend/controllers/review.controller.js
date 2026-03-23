// Member 2 - Review Controller (Rating & Review System)
const Review = require("../models/Review");
const Order = require("../models/Order");
const Gig = require("../models/Gig");
const { createNotification } = require("../utils/notificationHelper");

// ─── Member 2 - Submit Review (Buyer after order completion) ──────────────────
// POST /api/reviews
const submitReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    // rating: { overall, communication, quality, delivery, value }

    if (req.user.role !== "buyer") {
      return res.status(403).json({ success: false, message: "Only buyers can submit reviews." });
    }

    const order = await Order.findById(orderId).populate("gig");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only review completed orders." });
    }

    if (order.isReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this order." });
    }

    if (!rating || !rating.overall) {
      return res.status(400).json({ success: false, message: "Overall rating is required." });
    }

    const review = await Review.create({
      order: orderId,
      buyer: req.user._id,
      freelancer: order.freelancer,
      gig: order.gig._id,
      rating,
      comment: comment || "",
    });

    // Mark order as reviewed
    order.isReviewed = true;
    await order.save();

    // ─── Member 2 - Update gig average rating ────────────────────────────────
    const allReviews = await Review.find({ gig: order.gig._id, isDeleted: false });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allReviews.length;

    await Gig.findByIdAndUpdate(order.gig._id, {
      averageRating: parseFloat(avgRating.toFixed(2)),
      totalReviews: allReviews.length,
    });

     } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};