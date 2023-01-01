const mongoose = require("mongoose");

const QuantitySchema = new mongoose.Schema(
  {
    quantityCart: { type: Number, default: 0 },
    products: [
      {
        product_id: { type: String },
        quantity_sp: { type: Number, default: 1, min: 1 },
        // size_sp: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quantity", QuantitySchema);
