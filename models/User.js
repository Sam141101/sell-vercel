const mongoose = require("mongoose");
const Cart = require("../models/Cart");

const UserSchema = new mongoose.Schema(
  {
    cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    // contact: { type: String },
    username: { type: String, unique: true },
    fullname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    img: { type: String },
    phone: { type: Number },
    gender: { type: String },
    address: { type: Object },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
