const express = require("express");
const cartController = require("../controllers/cartController");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { getCart, addToCart, removeFromCart, deleteCart } = cartController;
router.route("/cart/add").patch(auth, addToCart);
router.route("/cart/remove").patch(auth, removeFromCart);
router.route("/cart").get(auth, getCart);
router.route("/cart").delete(auth, deleteCart);

module.exports = router;
