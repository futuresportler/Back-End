const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, refreshMiddleWare } = require("../middlewares/auth.middleware");
const {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateRequest,
  validateOTPRequest,
  validateOTPVerification,
} = require("../validation/userValidator");

router.get("/", validateRequest, authMiddleware, userController.getUserById);
router.patch("/", validateUpdateUser, validateRequest, authMiddleware, userController.updateUser);
router.delete("/", validateRequest, authMiddleware, userController.deleteUser);

router.post("/signup", validateCreateUser, validateRequest, userController.signup);
router.post("/signin", validateRequest, userController.signin);

router.post("/refresh-token", refreshMiddleWare, userController.refreshToken);
// router.post("/verify-token", userController.verifyTokenAndUpdateUser);
router.post("/request-otp", authMiddleware, userController.requestOTP);
router.post("/verify-otp", authMiddleware, validateOTPVerification, validateRequest, userController.verifyOTP);

module.exports = router;
