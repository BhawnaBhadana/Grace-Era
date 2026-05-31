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

  if (!userId || !productId) {
    res.status(400);
    throw new Error("userId and productId are required");
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    res.status(400);
    throw new Error("quantity must be an integer between 1 and 20");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
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
    cart.items[index].unitPrice = product.price;
    cart.items[index].name = product.name;
    cart.items[index].image = product.image;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      quantity,
      unitPrice: product.price
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
