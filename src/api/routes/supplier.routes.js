const express = require("express")
const router = express.Router()
const supplierController = require("../controllers/supplier.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

// Authentication routes
router.post("/signup", supplierController.signup)
router.post("/signin", supplierController.signin)
router.post("/refresh-token", supplierController.refreshToken)

// Profile routes
router.get("/me", authMiddleware, supplierController.getSupplierProfile)
router.patch("/me", authMiddleware, supplierController.updateSupplierProfile)
router.delete("/me", authMiddleware, supplierController.deleteSupplier)

// Module management
router.post("/module", authMiddleware, supplierController.setSupplierModule)
router.get("/module", authMiddleware, supplierController.getSupplierProfile)

router.get("/entities", authMiddleware, supplierController.getSupplierEntities)

router.get("/me/analytics/overview", authMiddleware, supplierController.getAnalyticsOverview);
// OTP routes
// router.post("/request-otp", authMiddleware, supplierController.requestOTP);
// router.post("/verify-otp", authMiddleware, supplierController.verifyOTP);
router.get("/invitations", authMiddleware, supplierController.getSupplierInvitations);
router.post("/invitations/:invitationToken/accept", authMiddleware, supplierController.acceptInvitation);
router.post("/invitations/:invitationToken/reject", authMiddleware, supplierController.rejectInvitation);
router.get("/managing-academies", authMiddleware, supplierController.getManagingAcademies);
router.get("/dashboard", authMiddleware, supplierController.getSupplierDashboard);

module.exports = router
