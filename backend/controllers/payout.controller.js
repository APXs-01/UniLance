// Member 1 - Payout Controller (Freelancer Withdrawal System)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PayoutRequest = require("../models/PayoutRequest");
const User = require("../models/User");
const { createOTP, verifyOTP } = require("../utils/otpService");
const { sendPayoutNotification } = require("../utils/emailService");
const { notifyPayoutApproved, notifyPayoutRejected } = require("../utils/notificationHelper");

// ─── Member 1 - Request Payout (Freelancer) ───────────────────────────────────
// POST /api/payouts/request
const requestPayout = async (req, res) => {
  try {
    const { amount, method, bankDetails } = req.body;

    if (req.user.role !== "freelancer") {
      return res.status(403).json({ success: false, message: "Only freelancers can request payouts." });
    }

    const user = await User.findById(req.user._id);

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${user.walletBalance.toFixed(2)}.`,
      });
    }

    if (amount < 10) {
      return res.status(400).json({ success: false, message: "Minimum payout amount is $10." });
    }

    // ─── Member 1 - Send OTP for payout verification ──────────────────────────
    const otp = await createOTP(user.email, "payout_verification");

    // We don't import sendPaymentOTP here to keep separation; reuse the payout email
    const { sendPaymentOTP } = require("../utils/emailService");
    await sendPaymentOTP(user.email, otp, user.name, amount * 100);

    // Create pending payout request
    const payoutRequest = await PayoutRequest.create({
      freelancer: req.user._id,
      amount,
      method: method || "stripe",
      stripeAccountId: user.stripeAccountId || "",
      bankDetails: bankDetails || {},
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Payout request created. Please verify with the OTP sent to your email.",
      payoutId: payoutRequest.payoutId,
      requestId: payoutRequest._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Verify OTP for Payout ────────────────────────────────────────
// POST /api/payouts/verify-otp
const verifyPayoutOTP = async (req, res) => {
  try {
    const { payoutRequestId, otp } = req.body;

    const result = await verifyOTP(req.user.email, otp, "payout_verification");
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const payoutRequest = await PayoutRequest.findById(payoutRequestId);
    if (!payoutRequest) {
      return res.status(404).json({ success: false, message: "Payout request not found." });
    }

    payoutRequest.status = "otp_verified";
    payoutRequest.otpVerified = true;
    payoutRequest.otpVerifiedAt = new Date();
    await payoutRequest.save();

    res.status(200).json({
      success: true,
      message: "Payout OTP verified. Your request is now pending admin approval.",
      payoutId: payoutRequest.payoutId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Get Freelancer Payout History ────────────────────────────────
// GET /api/payouts/history
const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ freelancer: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Admin: Get all pending payout requests ────────────────────────
// GET /api/payouts/admin/pending
const getPendingPayouts = async (req, res) => {
  try {
    const payouts = await PayoutRequest.find({ status: "otp_verified" })
      .populate("freelancer", "name email stripeAccountId walletBalance")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, payouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Admin: Approve Payout ────────────────────────────────────────
// PUT /api/payouts/admin/:payoutRequestId/approve
const approvePayout = async (req, res) => {
  try {
    const payoutRequest = await PayoutRequest.findById(req.params.payoutRequestId)
      .populate("freelancer");

    if (!payoutRequest) {
      return res.status(404).json({ success: false, message: "Payout request not found." });
    }

    if (payoutRequest.status !== "otp_verified") {
      return res.status(400).json({ success: false, message: "Payout must be OTP-verified before approval." });
    }

    const freelancer = await User.findById(payoutRequest.freelancer._id);

    // Deduct from wallet
    if (freelancer.walletBalance < payoutRequest.amount) {
      return res.status(400).json({ success: false, message: "Freelancer has insufficient balance." });
    }

    // ─── Member 1 - Process Stripe Payout (if stripe account connected) ───────
    let stripePayoutId = "";
    if (payoutRequest.method === "stripe" && freelancer.stripeAccountId) {
      try {
        const stripePayout = await stripe.transfers.create({
          amount: Math.round(payoutRequest.amount * 100),
          currency: "usd",
          destination: freelancer.stripeAccountId,
          description: `UniLance payout ${payoutRequest.payoutId}`,
        });
        stripePayoutId = stripePayout.id;
      } catch (stripeError) {
        return res.status(500).json({ success: false, message: `Stripe payout failed: ${stripeError.message}` });
      }
    }

    freelancer.walletBalance -= payoutRequest.amount;
    await freelancer.save();

    payoutRequest.status = "completed";
    payoutRequest.processedBy = req.user._id;
    payoutRequest.processedAt = new Date();
    payoutRequest.stripePayoutId = stripePayoutId;
    await payoutRequest.save();

    // Notify freelancer
    await notifyPayoutApproved(freelancer._id, payoutRequest._id, payoutRequest.amount);
    await sendPayoutNotification(freelancer.email, freelancer.name, {
      amount: payoutRequest.amount,
      currency: "usd",
      status: "completed",
      payoutId: payoutRequest.payoutId,
    });

    res.status(200).json({ success: true, message: "Payout approved and processed." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Admin: Reject Payout ─────────────────────────────────────────
// PUT /api/payouts/admin/:payoutRequestId/reject
const rejectPayout = async (req, res) => {
  try {
    const { reason } = req.body;
    const payoutRequest = await PayoutRequest.findById(req.params.payoutRequestId)
      .populate("freelancer", "name email");

    if (!payoutRequest) {
      return res.status(404).json({ success: false, message: "Payout request not found." });
    }

    payoutRequest.status = "rejected";
    payoutRequest.rejectionNote = reason || "No reason provided.";
    payoutRequest.processedBy = req.user._id;
    payoutRequest.processedAt = new Date();
    await payoutRequest.save();

    await notifyPayoutRejected(payoutRequest.freelancer._id, payoutRequest._id, reason);
    await sendPayoutNotification(
      payoutRequest.freelancer.email,
      payoutRequest.freelancer.name,
      {
        amount: payoutRequest.amount,
        currency: "usd",
        status: "rejected",
        payoutId: payoutRequest.payoutId,
      }
    );

    res.status(200).json({ success: true, message: "Payout rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestPayout,
  verifyPayoutOTP,
  getPayoutHistory,
  getPendingPayouts,
  approvePayout,
  rejectPayout,
};
