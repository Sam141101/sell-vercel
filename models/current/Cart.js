const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    product_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    quantity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quantity" },
    price_id: { type: mongoose.Schema.Types.ObjectId, ref: "Price" },
    size_id: { type: mongoose.Schema.Types.ObjectId, ref: "Size" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
