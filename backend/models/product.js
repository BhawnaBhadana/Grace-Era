const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ""
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    stock: {
      type: Number,
      min: 0,
      default: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);