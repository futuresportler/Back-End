const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

// Admin routes
router.post("/generate-fees", authenticate, authorize(["admin"]), adminController.triggerFeeGeneration)
router.post("/trigger-metrics-update", authenticate, authorize(["admin"]), adminController.triggerMetricsUpdate);
module.exports = router
