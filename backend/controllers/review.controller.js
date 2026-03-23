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

    // Notify freelancer
    await createNotification({
      recipient: order.freelancer,
      title: "New Review Received",
      message: `You received a ${rating.overall}-star review.`,
      type: "new_review",
      relatedId: review._id,
      relatedModel: "Review",
      link: `/gigs/${order.gig._id}`,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
} catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 2 - Get Reviews for a Gig ────────────────────────────────────────
// GET /api/reviews/gig/:gigId
const getGigReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { gig: req.params.gigId, isDeleted: false };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("buyer", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Rating breakdown
    const allReviews = await Review.find(query).select("rating");
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((r) => {
      const rounded = Math.round(r.rating.overall);
      if (breakdown[rounded] !== undefined) breakdown[rounded]++;
    });

    res.status(200).json({
      success: true,
      reviews,
      ratingBreakdown: breakdown,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 2 - Get Reviews for a Freelancer ─────────────────────────────────
// GET /api/reviews/freelancer/:freelancerId
const getFreelancerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { freelancer: req.params.freelancerId, isDeleted: false };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("buyer", "name profilePicture")
      .populate("gig", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      reviews,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 2 - Freelancer Reply to Review ───────────────────────────────────
// PUT /api/reviews/:reviewId/reply
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    review.freelancerReply = reply;
    review.freelancerRepliedAt = new Date();
    await review.save();

    res.status(200).json({ success: true, message: "Reply added.", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};