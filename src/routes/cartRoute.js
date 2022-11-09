const express = require("express");
const cartController = require("../controllers/cartController");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { getCart, addToCart, removeFromCart, deleteCart } = cartController;
router.route("/cart/add/:id").patch(auth, addToCart);
router.route("/cart/remove/:id").patch(auth, removeFromCart);
router.route("/cart/:id").get(auth, getCart);
router.route("/cart/:id").delete(auth, deleteCart);

module.exports = router;
