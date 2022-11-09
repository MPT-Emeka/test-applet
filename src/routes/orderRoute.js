const express = require("express");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const router = express.Router();
const orderController = require("../controllers/orderController");

const app = express();

app.use(express.json());

    const { createOrder , updateOrder, getUserOrder, deleteOrder, getAllOrders } = orderController;

    
    router.route("/order/create/:userId").post(auth, createOrder);
    router.route("/order/update/:userId").patch(auth, updateOrder);
    router.route("/order/:userId").get(auth, getUserOrder).delete(auth, deleteOrder);
    router.route("/allOrders").get(auth, getAllOrders) // add  check user role. 
    

module.exports = router;