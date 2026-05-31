const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
  type: mongoose.Schema.Types.Mixed,  // ← change from ObjectId to Mixed
  required: true
},
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true
      // 
    },
    items: {
      type: [cartItemSchema],
      default: []
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

// Single unique index on userId
cartSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);