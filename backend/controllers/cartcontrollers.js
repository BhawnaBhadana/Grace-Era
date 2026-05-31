const validator = require("validator");
const asyncHandler = require("../middleware/asyncHandler");
const Cart = require("../models/cart");
const Product = require("../models/product");

const computeTotal = (items) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const getCart = asyncHandler(async (req, res) => {
  const userId = validator.trim(req.query.userId || "");

  if (!userId) {
    res.status(400);
    throw new Error("userId is required");
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.json({ success: true, data: { userId, items: [], total: 0 } });
  }

  res.json({ success: true, data: cart });
});

const upsertCartItem = asyncHandler(async (req, res) => {
  const userId = validator.trim(req.body.userId || "");
  const productId = validator.trim(req.body.productId || "");
  const quantity = Number(req.body.quantity || 1);
  // Accept product details from frontend as fallback
  const clientName = req.body.name || "";
  const clientPrice = Number(req.body.unitPrice || req.body.price || 0);
  const clientImage = req.body.image || "";

  if (!userId || !productId) {
    res.status(400);
    throw new Error("userId and productId are required");
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    res.status(400);
    throw new Error("quantity must be an integer between 1 and 20");
  }

  // Try to find product in DB, fall back to client-provided data
  let productName = clientName;
  let productPrice = clientPrice;
  let productImage = clientImage;

  try {
    const product = await Product.findById(productId);
    if (product) {
      productName = product.name;
      productPrice = product.price;
      productImage = product.image;
    }
  } catch (e) {
    // productId is not a mongo ObjectId (e.g. 'p1'), use client data
  }

  if (!productName || !productPrice) {
    res.status(400);
    throw new Error("Product not found and no fallback data provided");
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [], total: 0 });
  }

  const index = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index > -1) {
    cart.items[index].quantity = quantity;
    cart.items[index].unitPrice = productPrice;
    cart.items[index].name = productName;
    cart.items[index].image = productImage;
  } else {
    cart.items.push({
      product: productId,
      name: productName,
      image: productImage,
      quantity,
      unitPrice: productPrice
    });
  }

  cart.total = computeTotal(cart.items);
  await cart.save();

  res.json({ success: true, data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = validator.trim(req.query.userId || req.body.userId || "");
  const productId = validator.trim(req.params.id || "");

  if (!userId || !productId) {
    res.status(400);
    throw new Error("userId and cart item id are required");
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.json({ success: true, data: { userId, items: [], total: 0 } });
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  cart.total = computeTotal(cart.items);
  await cart.save();

  res.json({ success: true, data: cart });
});

const clearCartByUserId = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return;

  cart.items = [];
  cart.total = 0;
  await cart.save();
};

module.exports = {
  getCart,
  upsertCartItem,
  removeCartItem,
  clearCartByUserId
};
