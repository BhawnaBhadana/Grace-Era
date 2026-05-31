const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80
    },
    externalId: {
      type: String,
      trim: true,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);