const express = require("express");
const recommendController = require("../controllers/recommendController");
const { auth, checkUser } = require("../middlewares/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { recommendDrinks } = recommendController;
router.route("/recommendedDrinks").post(recommendDrinks);

module.exports = router;