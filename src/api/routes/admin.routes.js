const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const { authenticate, authorize, adminAuthMiddleware } = require("../middlewares/auth.middleware")

// Admin routes
router.post("/generate-fees", authenticate, authorize(["admin"]), adminController.triggerFeeGeneration)
router.get("/audit-log", authenticate, adminController.getAuditLogs)
// Intern Portal routes
router.post("/request-otp", adminController.requestOTP);
router.post("/verify-otp", adminController.verifyOTP);
router.get("/services", adminAuthMiddleware, adminController.getServices);
router.delete("/services/:serviceId", adminAuthMiddleware, adminController.deleteService);

module.exports = router
