// Member 2 - Order Routes (Order Management, Delivery, Status Tracking)
const express = require("express");
const router = express.Router();
const {
  placeOrder,
  respondToOrder,
  submitDelivery,
  reviewDelivery,
  getOrder,
  getMyOrders,
  cancelOrder,
} = require("../controllers/order.controller");
const { protect } = require("../middleware/auth.middleware");
const { isBuyer, isFreelancer } = require("../middleware/role.middleware");

// Member 2 - placeOrder
router.post("/", protect, isBuyer, placeOrder);

// Member 2 - getMyOrders (buyer or freelancer)
router.get("/my-orders", protect, getMyOrders);

// Member 2 - getOrderById
router.get("/:orderId", protect, getOrder);
