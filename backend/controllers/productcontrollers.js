const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/product");

const getProducts = asyncHandler(async (req, res) => {
  const { search = "", category = "", minPrice, maxPrice } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

module.exports = { getProducts };