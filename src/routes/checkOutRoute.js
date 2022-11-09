const express = require("express");
const paymentController = require("../controllers/paymentController");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { checkoutOrder } = paymentController;

router.route("/checkout").post(auth, checkoutOrder);

module.exports = router;