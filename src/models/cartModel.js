const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    _id: { type: String, required: [true, "input a valid userId"] },
    products: [
      {
        productID: String,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          autopopulate: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        subtotal: {
          type: Number,
          default: 0,
        },
      },
    ],
    itemCount: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);
CartSchema.plugin(require("mongoose-autopopulate"));

module.exports = mongoose.model("Cart", CartSchema);
