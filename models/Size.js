const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema(
  {
    products: [
      {
        size_sp: { type: String },
        product_id: { type: String },
        // product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Size", SizeSchema);
