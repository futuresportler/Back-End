const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coach.controller");
const {
  authMiddleware,
  refreshMiddleWare,
} = require("../middlewares/auth.middleware");
const {
  validateCreateCoach,
  validateUpdateCoach,
  validateCoachId,
  validateRequest,
  validateOTPRequest,
  validateOTPVerification,
} = require("../validation/coachValidator");
const auth = require("../../config/firebase");

//get all coaches list
router.get("/all", authMiddleware, coachController.getAllCoaches);

//coach actions
router.get("/", validateRequest, authMiddleware, coachController.getCoachById);
router.patch(
  "/",
  validateUpdateCoach,
  validateRequest,
  authMiddleware,
  coachController.updateCoach
);
router.delete(
  "/",
  validateRequest,
  authMiddleware,
  coachController.deleteCoach
);

// Review routes
router.post("/:coachId/reviews", authMiddleware, coachController.addReview);
router.put(
  "/:coachId/reviews/:reviewId",
  authMiddleware,
  coachController.updateReview
);

//login actions
router.post(
  "/signup",
  validateCreateCoach,
  validateRequest,
  coachController.signup
);
router.post("/signin", validateRequest, coachController.signin);

//token actions
router.post("/refresh-token", refreshMiddleWare, coachController.refreshToken);
router.post("/verify-token", coachController.verifyTokenAndUpdateCoach);
router.post("/request-otp", authMiddleware, coachController.requestOTP);
router.post(
  "/verify-otp",
  authMiddleware,
  validateOTPVerification,
  validateRequest,
  coachController.verifyOTP
);

//forgot password
router.post("/forgot-password", coachController.forgotPassword);
router.post("/verify-forgot-password", coachController.forgotPasswordOTPVerify);
router.post("/reset-password", authMiddleware, coachController.resetPassword);

//OAuth authentication
router.post("/oauth", coachController.handleOAuthSignIn);

module.exports = router;
