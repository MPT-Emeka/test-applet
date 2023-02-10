const express = require("express");
const productController = require("../controllers/productController");
const { auth, checkUser } = require("../middlewares/authMiddleware");

const productRouter = express.Router();

const { createProduct, updateProduct, getProduct, getProductListing, deleteProduct } =
  productController;

productRouter
  .route("/product")
  .post(auth, checkUser("gulp"), createProduct)
  .get( getProductListing ) 
  .delete(auth, checkUser("gulp"), deleteProduct);

productRouter.patch("/product/:id", auth, checkUser("gulp"), updateProduct);
productRouter.get("/product/:id", getProduct );

module.exports = productRouter;
