const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        // productId: {
        //   type: String,
        // },
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        // list_product: [
        //   { type: mongoose.Schema.Types.ObjectId, ref: "ListProduct" },
        // ],

        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
        },
        size: {
          type: String,
        },
      },
    ],
    amount: { type: Number, required: true },
    method: { type: String },
    // address: { type: Object, required: true },
    // address: { type: String },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
