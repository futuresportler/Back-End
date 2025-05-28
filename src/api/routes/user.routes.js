const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const {
  authMiddleware,
  refreshMiddleWare,
} = require("../middlewares/auth.middleware");
const {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateRequest,
  validateOTPRequest,
  validateOTPVerification,
  validateAddFavorite,
  validateRemoveFavorite,
  validateCheckFavorite,
  validateGetFavorites,
} = require("../validation/userValidator");
const auth = require("../../config/firebase");

//user actions
router.get("/", validateRequest, authMiddleware, userController.getUserById);
router.patch(
  "/",
  validateUpdateUser,
  validateRequest,
  authMiddleware,
  userController.updateUser
);
router.delete("/", validateRequest, authMiddleware, userController.deleteUser);

//login actions
router.post(
  "/signup",
  validateCreateUser,
  validateRequest,
  userController.signup
);
router.post("/signin", validateRequest, userController.signin);

//token actions
router.post("/refresh-token", refreshMiddleWare, userController.refreshToken);
router.post("/verify-token", userController.verifyTokenAndUpdateUser);
router.post("/request-otp", authMiddleware, userController.requestOTP);
router.post(
  "/verify-otp",
  authMiddleware,
  validateOTPVerification,
  validateRequest,
  userController.verifyOTP
);

//forgot password
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-forgot-password", userController.forgotPasswordOTPVerify);
router.post("/reset-password", authMiddleware, userController.resetPassword);

//OAuth authentication
router.post("/oauth", userController.handleOAuthSignIn);


// Favorites routes - Add these before module.exports
router.post(
  "/favorites",
  validateAddFavorite,
  validateRequest,
  authMiddleware,
  userFavoriteController.addToFavorites
);

router.delete(
  "/favorites/:entityType/:entityId",
  validateRemoveFavorite,
  validateRequest,
  authMiddleware,
  userFavoriteController.removeFromFavorites
);

router.get(
  "/favorites",
  validateGetFavorites,
  validateRequest,
  authMiddleware,
  userFavoriteController.getUserFavorites
);

router.get(
  "/favorites/:entityType/:entityId/check",
  validateCheckFavorite,
  validateRequest,
  authMiddleware,
  userFavoriteController.checkIsFavorite
);


router.get(
  "/favorites/stats",
  authMiddleware,
  userFavoriteController.getFavoriteStats
);

module.exports = router;
