const express = require("express");
const router = express.Router();
const academyController = require("../controllers/academy.controller");
const { authMiddleware, refreshMiddleWare } = require("../middlewares/auth.middleware");
const {
  validateCreateAcademy,
  validateUpdateAcademy,
  validateAcademyId,
  validateRequest,
  validateOTPRequest,
  validateOTPVerification,
} = require("../validation/academyValidator");
const auth = require("../../config/firebase");

//academy actions
router.get("/", validateRequest, authMiddleware, academyController.getAcademyById);
router.patch("/", validateUpdateAcademy, validateRequest, authMiddleware, academyController.updateAcademy);
router.delete("/", validateRequest, authMiddleware, academyController.deleteAcademy);

//login actions
router.post("/signup", validateCreateAcademy, validateRequest, academyController.signup);
router.post("/signin", validateRequest, academyController.signin);

//token actions
router.post("/refresh-token", refreshMiddleWare, academyController.refreshToken);
// router.post("/verify-token", academyController.verifyTokenAndUpdateAcademy);
router.post("/request-otp", authMiddleware, academyController.requestOTP);
router.post("/verify-otp", authMiddleware, validateOTPVerification, validateRequest, academyController.verifyOTP);

//forgot password
router.post("/forgot-password", academyController.forgotPassword);
router.post("/verify-forgot-password", academyController.forgotPasswordOTPVerify);
router.post("/reset-password", authMiddleware, academyController.resetPassword);
module.exports = router;
