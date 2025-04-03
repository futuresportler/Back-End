const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateSupplierSignup,
  validateSupplierUpdate,
  validateRequest
} = require("../validation/supplierValidator");

// Authentication routes
router.post("/signup", validateSupplierSignup, validateRequest, supplierController.signup);
router.post("/signin", validateRequest, supplierController.signin);
router.post("/refresh-token", supplierController.refreshToken);

// Profile routes
router.get("/me", authMiddleware, supplierController.getSupplierProfile);
router.patch("/me", authMiddleware, validateSupplierUpdate, validateRequest, supplierController.updateSupplierProfile);
router.delete("/me", authMiddleware, supplierController.deleteSupplier);

// Module management
router.post("/module", authMiddleware, supplierController.setSupplierModule);
router.get("/module", authMiddleware, supplierController.getSupplierModule);

// OTP routes
router.post("/request-otp", authMiddleware, supplierController.requestOTP);
router.post("/verify-otp", authMiddleware, supplierController.verifyOTP);

// Password recovery
router.post("/forgot-password", supplierController.forgotPassword);
router.post("/reset-password", authMiddleware, supplierController.resetPassword);

module.exports = router;