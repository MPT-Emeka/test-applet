const authController = require("../controllers/auth-controller");
const express = require("express");
const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

const {
  signIn,
  signUp,
  forgotPasswordController,
  resetPasswordController,
  logout,
  deleteUser,
} = authController;

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/logout/:id", auth, logout);
router.delete("/delete", auth, deleteUser);

router
  .route("/forgotpassword")
  .put(forgotPasswordController)
  router.post("/reset-password/:token", resetPasswordController);

module.exports = router;
