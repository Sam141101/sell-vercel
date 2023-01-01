const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema(
  {
    totalPrice: { type: Number, default: 0 },
    products: [
      {
        price_sp: { type: Number, default: 0 },
        // product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        product_id: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Price", PriceSchema);
