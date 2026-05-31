const crypto = require("crypto");
const Razorpay = require("razorpay");
const validator = require("validator");
const asyncHandler = require("../middleware/asyncHandler");
const Cart = require("../models/cart");
const Order = require("../models/Order");
const { sendOrderEmail } = require("../services/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const userId = validator.trim(req.body.userId || "");

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const options = {
    amount: Math.round(cart.total * 100),
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: { userId }
  };

  const paymentOrder = await razorpay.orders.create(options);

  res.json({
    success: true,
    data: {
      paymentOrder,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID
    }
  });
});

const verifyPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    email,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature
  } = req.body;

  const safeUserId = validator.trim(userId || "");
  const safeEmail = validator.normalizeEmail(validator.trim(email || ""));

  if (!safeUserId || !safeEmail || !validator.isEmail(safeEmail)) {
    res.status(400);
    throw new Error("Valid userId and email are required");
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error("Payment verification fields are missing");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error("Payment signature verification failed");
  }

  const cart = await Cart.findOne({ userId: safeUserId });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const order = await Order.create({
    userId: safeUserId,
    email: safeEmail,
    items: cart.items,
    total: cart.total,
    currency: "INR",
    paymentStatus: "paid",
    paymentMethod: "razorpay",
    paymentId: razorpayPaymentId,
    status: "confirmed"
  });

  cart.items = [];
  cart.total = 0;
  await cart.save();

  await sendOrderEmail({
    to: safeEmail,
    orderId: order._id,
    total: order.total,
    items: order.items
  });

  res.json({ success: true, message: "Payment verified", data: order });
});

module.exports = {
  createPaymentOrder,
  verifyPaymentAndCreateOrder
};