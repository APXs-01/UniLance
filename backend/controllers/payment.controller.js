// Member 1 - Payment Controller (Stripe Integration, Transaction Management, Discounts)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const Discount = require("../models/Discount");
const User = require("../models/User");
const { createOTP, verifyOTP } = require("../utils/otpService");
const { sendPaymentOTP, sendPaymentConfirmationEmail } = require("../utils/emailService");
const { generateTransactionHistoryPDF, generatePaymentSlipPDF } = require("../utils/pdfService");
const { notifyPaymentReceived } = require("../utils/notificationHelper");
const { releaseOrderPayment } = require("../utils/paymentService"); // Member 1

// ─── Member 1 - Create Stripe Payment Intent (Step 1 of checkout) ─────────────
// POST /api/payments/create-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, discountCode } = req.body;

    const order = await Order.findById(orderId)
      .populate("gig", "title price category")
      .populate("buyer", "name email stripeCustomerId")
      .populate("freelancer", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Order already paid." });
    }

    let amountInCents = Math.round(order.price * 100);
    let discountAmount = 0;
    let appliedDiscount = null;

    // ─── Member 1 - Apply Discount Code ───────────────────────────────────────
    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (!discount) {
        return res.status(400).json({ success: false, message: "Invalid or expired discount code." });
      }

      if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
        return res.status(400).json({ success: false, message: "Discount code usage limit reached." });
      }

      if (discount.usedBy.includes(req.user._id)) {
        return res.status(400).json({ success: false, message: "You have already used this discount code." });
      }

      if (order.price < discount.minOrder) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount for this discount is $${discount.minOrder}.`,
        });
      }

      if (discount.type === "percentage") {
        discountAmount = Math.round((amountInCents * discount.value) / 100);
      } else {
        discountAmount = Math.round(discount.value * 100);
      }

      amountInCents = Math.max(50, amountInCents - discountAmount); // Stripe min $0.50
      appliedDiscount = discount;
    }

    // ─── Platform fee: 10% commission ────────────────────────────────────────
    const platformFee = Math.round(amountInCents * 0.10);
    const freelancerEarnings = amountInCents - platformFee;

    // ─── Create/Get Stripe Customer ───────────────────────────────────────────
    let customerId = order.buyer.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: order.buyer.email,
        name: order.buyer.name,
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(order.buyer._id, { stripeCustomerId: customerId });
    }

    // ─── Member 1 - Create Stripe Payment Intent ───────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      description: `UniLance Order ${order.orderNumber} - ${order.gig.title}`,
      metadata: {
        orderId: order._id.toString(),
        buyerId: order.buyer._id.toString(),
        freelancerId: order.freelancer._id.toString(),
      },
    });

    // ─── Member 1 - Send Payment OTP for verification ─────────────────────────
    const otp = await createOTP(order.buyer.email, "payment_verification");
    await sendPaymentOTP(order.buyer.email, otp, order.buyer.name, amountInCents);

    // Save payment intent to order
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      discountApplied: discountAmount > 0,
      discountAmount,
      platformFee,
      freelancerEarnings,
      message: "OTP sent to your email for payment verification.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Verify OTP and Confirm Payment ────────────────────────────────
// POST /api/payments/verify-otp
const verifyPaymentOTP = async (req, res) => {
  try {
    const { orderId, otp, paymentIntentId, discountCode } = req.body;

    // ─── Member 1 - Verify OTP ────────────────────────────────────────────────
    const otpResult = await verifyOTP(req.user.email, otp, "payment_verification");
    if (!otpResult.valid) {
      return res.status(400).json({ success: false, message: otpResult.message });
    }

    const order = await Order.findById(orderId)
      .populate("gig", "title price category")
      .populate("buyer", "name email")
      .populate("freelancer", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Retrieve payment intent to confirm amount
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const amountInCents = paymentIntent.amount;

    const platformFee = Math.round(amountInCents * 0.10);
    const freelancerEarnings = amountInCents - platformFee;

    let discountAmount = 0;
    if (discountCode) {
      const discount = await Discount.findOne({ code: discountCode.toUpperCase() });
      if (discount) {
        discountAmount = discount.type === "percentage"
          ? Math.round((order.price * 100 * discount.value) / 100)
          : Math.round(discount.value * 100);
        discount.usedCount += 1;
        discount.usedBy.push(req.user._id);
        await discount.save();
      }
    }

    // ─── Member 1 - Create Transaction Record ─────────────────────────────────
    const transaction = await Transaction.create({
      buyer: order.buyer._id,
      freelancer: order.freelancer._id,
      order: order._id,
      amount: amountInCents,
      platformFee,
      freelancerEarnings,
      discountCode: discountCode || "",
      discountAmount,
      stripePaymentIntentId: paymentIntentId,
      status: "pending",
      otpVerified: true,
    });

    // Update order
    order.paymentStatus = "paid";
    order.status = "accepted";
    order.transaction = transaction._id;
    order.acceptedAt = new Date();
    await order.save();

    // ─── Member 1 - Send payment confirmation email ───────────────────────────
    await sendPaymentConfirmationEmail(order.buyer.email, order.buyer.name, {
      orderNumber: order.orderNumber,
      amount: amountInCents,
      currency: "usd",
      gigTitle: order.gig.title,
    });

    // ─── Member 1 - Notify freelancer of payment received ─────────────────────
    await notifyPaymentReceived(order.freelancer._id, order._id, amountInCents);

    res.status(200).json({
      success: true,
      message: "Payment verified and confirmed. Order is now active.",
      transactionId: transaction.transactionId,
      orderId: order._id,
      orderStatus: order.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Stripe Webhook Handler ────────────────────────────────────────
// POST /api/payments/webhook
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // ─── Handle Stripe Events (Member 1) ─────────────────────────────────────
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "completed", stripeChargeId: intent.latest_charge }
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "failed" }
      );
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      await Transaction.findOneAndUpdate(
        { stripeChargeId: charge.id },
        { status: "refunded" }
      );
      break;
    }
  }

  res.json({ received: true });
};

// ─── Member 1 - Release Payment to Freelancer (manual admin override endpoint) ─
// POST /api/payments/release/:orderId
const releasePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ success: false, message: "Order must be completed to release payment." });
    }

    const transaction = await Transaction.findById(order.transaction);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    if (transaction.status === "released") {
      return res.status(400).json({ success: false, message: "Payment already released." });
    }

    // ─── Member 1 - Use shared payment service to release ─────────────────────
    const released = await releaseOrderPayment(order);

    res.status(200).json({
      success: true,
      message: "Payment released to freelancer wallet.",
      releasedAmount: released.freelancerEarnings / 100,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Get Transaction History (Buyer or Freelancer) ─────────────────
// GET /api/payments/transactions
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : { freelancer: req.user._id };

    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate({ path: "order", populate: { path: "gig", select: "title category" } })
      .populate("buyer", "name email")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      transactions,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Export Transaction History as PDF ────────────────────────────
// GET /api/payments/transactions/export
const exportTransactionsPDF = async (req, res) => {
  try {
    const query =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : { freelancer: req.user._id };

    const transactions = await Transaction.find(query)
      .populate({ path: "order", populate: { path: "gig", select: "title" } })
      .sort({ createdAt: -1 });

    const pdfBuffer = await generateTransactionHistoryPDF(transactions, req.user);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="UniLance_Transactions_${Date.now()}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Generate Payment Slip PDF ────────────────────────────────────
// GET /api/payments/slip/:transactionId
const getPaymentSlip = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: req.params.transactionId,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    const order = await Order.findById(transaction.order)
      .populate("buyer", "name email")
      .populate("freelancer", "name email")
      .populate("gig", "title category");

    const pdfBuffer = await generatePaymentSlipPDF(transaction, order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="UniLance_Slip_${transaction.transactionId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Member 1 - Validate Discount Code ────────────────────────────────────────
// POST /api/payments/discount/validate
const validateDiscountCode = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!discount) {
      return res.status(400).json({ success: false, message: "Invalid or expired discount code." });
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ success: false, message: "Discount usage limit reached." });
    }

    if (discount.usedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You have already used this code." });
    }

    const savings =
      discount.type === "percentage"
        ? (orderAmount * discount.value) / 100
        : discount.value;

    res.status(200).json({
      success: true,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        savings: parseFloat(savings.toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  verifyPaymentOTP,
  stripeWebhook,
  releasePayment,
  getTransactionHistory,
  exportTransactionsPDF,
  getPaymentSlip,
  validateDiscountCode,
};
