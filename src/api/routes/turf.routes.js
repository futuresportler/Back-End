const express = require("express");
const router = express.Router();
const turfController = require("../controllers/turf.controller");
const {
  authMiddleware,
  refreshMiddleWare,
} = require("../middlewares/auth.middleware");
const {
  validateCreateTurf,
  validateUpdateTurf,
  validateCommentCreate,
  validateCommentUpdate,
  validateOTPVerification,
  validateRequest,
} = require("../validation/turfValidator");

// Get all turfs list (public)
router.get("/all", turfController.getAllTurfs);

// Turf profile actions
router.get("/", validateRequest, authMiddleware, turfController.getTurfById);
router.patch(
  "/",
  validateUpdateTurf,
  validateRequest,
  authMiddleware,
  turfController.updateTurf
);
router.delete("/", validateRequest, authMiddleware, turfController.deleteTurf);

// Authentication actions
router.post(
  "/signup",
  validateCreateTurf,
  validateRequest,
  turfController.signup
);
router.post("/signin", validateRequest, turfController.signin);

// Token actions
router.post("/refresh-token", refreshMiddleWare, turfController.refreshToken);
router.post("/request-otp", authMiddleware, turfController.requestOTP);
router.post(
  "/verify-otp",
  authMiddleware,
  validateOTPVerification,
  validateRequest,
  turfController.verifyOTP
);

// Password recovery
router.post("/forgot-password", turfController.forgotPassword);
router.post("/verify-forgot-password", turfController.forgotPasswordOTPVerify);
router.post("/reset-password", authMiddleware, turfController.resetPassword);

// Review/Comment management
router.post(
  "/:turfId/comments",
  authMiddleware,
  validateCommentCreate,
  validateRequest,
  turfController.addComment
);
router.put(
  "/:turfId/comments/:reviewId",
  authMiddleware,
  validateCommentUpdate,
  validateRequest,
  turfController.updateComment
);
router.delete(
  "/comments/:reviewId",
  authMiddleware,
  turfController.deleteComment
);

// Booking endpoints
router.post("/:turfId/book", authMiddleware, turfController.bookTurf);
router.get("/:turfId/calendar", turfController.getTurfCalendar);

module.exports = router;
