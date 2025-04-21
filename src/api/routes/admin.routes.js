const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

// Admin routes
router.post("/generate-fees", authenticate, authorize(["admin"]), adminController.triggerFeeGeneration)

module.exports = router
