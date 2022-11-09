const express = require("express");
const UserController = require("../controllers/userController");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { updateUser, getUser, getAllUsers, deleteUser } = UserController;

router.route("/user").get(auth, getAllUsers).delete(auth, deleteUser);

router.route("/user/:id").get(auth, getUser).put(auth, updateUser);

module.exports = router;
