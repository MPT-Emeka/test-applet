const express = require("express");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const router = express.Router();
const orderController = require("../controllers/orderController");

const app = express();

app.use(express.json());

    const { createOrder , updateOrder, getUserOrder, deleteOrder, getAllOrders } = orderController;

    
    router.route("/order/create").post(auth, createOrder);
    router.route("/order/update").patch(auth, updateOrder);
    router.route("/order").get(auth, getUserOrder)
    router.route("/order").delete(auth, checkUser("gulp"), deleteOrder);
    router.route("/allOrders").get(auth, checkUser("gulp"), getAllOrders);
    

module.exports = router;