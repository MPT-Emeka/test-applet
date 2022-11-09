const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please enter name of drink"],
    minlength: [3, "Minimum length of drink name is 3 characters"],
    maxlength: 20,
  },
  category: {
    type: String,
    required: [true, "Please enter a category"],
    minlength: [2, "Minimum length of category is 4 characters"],
    maxlength: 30,
  },
  subCategory: {
    type: String,
    required: [true, "Please enter a sub category"],
    minlength: [2, "Minimum length of sub category is 4 characters"],
    maxlength: 30,
  },
  gulp: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
    required: [true, "Please create a gulp admin account"],
  },
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "Product"
  },
  amountInStock: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    required: [true, "Enter a price"],
  },
  brand: {
    type: String,
    required: [true, "Enter a brand"],
  },
  description: {
    type: String,
    required: [true, "Enter a product description"],
    minlength: [13, "Minimum length of description is 13 characters"],
    maxlength: 300,
  },
  expiryDate: {
    type: String,
    required: [true, "Enter an expiry date"]
  },
  images: {
    type: String,
    required: [true, "Enter image URL"],
  },
  occasion: {
    type: String,
    required: [true, "Enter an occasion e.g anniversary"],
    minlength: [2, "Minimum length of occasion is 6 characters"],
    maxlength: 20,
  }
}, { timestamps: true }
);



const Product = mongoose.model("product", productSchema);

module.exports = Product
