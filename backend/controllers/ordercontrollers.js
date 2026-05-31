const validator = require("validator");
const asyncHandler = require("../middleware/asyncHandler");
const Cart = require("../models/cart");
const Order = require("../models/Order");
const { sendOrderEmail } = require("../services/emailService");

const createOrder = asyncHandler(async (req, res) => {
  const userId = validator.trim(req.body.userId || "");
  const email = validator.normalizeEmail(validator.trim(req.body.email || ""));
  const paymentMethod = validator.trim(req.body.paymentMethod || "cod").toLowerCase();

  if (!userId || !email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error("Valid userId and email are required");
  }

  if (!["cod", "razorpay"].includes(paymentMethod)) {
    res.status(400);
    throw new Error("paymentMethod must be cod or razorpay");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const isPaid = paymentMethod === "razorpay";

  const order = await Order.create({
    userId,
    email,
    items: cart.items,
    total: cart.total,
    currency: "INR",
    paymentStatus: isPaid ? "paid" : "pending",
    paymentMethod,
    status: isPaid ? "confirmed" : "created"
  });

  cart.items = [];
  cart.total = 0;
  await cart.save();

  await sendOrderEmail({
    to: email,
    orderId: order._id,
    total: order.total,
    items: order.items
  });

  res.status(201).json({ success: true, data: order });
});

module.exports = { createOrder };