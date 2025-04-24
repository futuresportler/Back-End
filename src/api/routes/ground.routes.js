const express = require("express")
const router = express.Router()
const groundController = require("../controllers/ground.controller")
const { authenticate, authorize } = require("../middlewares/auth.middleware")

// Ground CRUD routes
router.post("/turf/:turfId/grounds", authenticate, groundController.createGround)
router.get("/grounds/:groundId", groundController.getGround)
router.get("/turf/:turfId/grounds", groundController.getGroundsByTurf)
router.patch("/grounds/:groundId", authenticate, groundController.updateGround)
router.delete("/grounds/:groundId", authenticate, groundController.deleteGround)

// Ground image routes
router.post("/grounds/:groundId/images", authenticate, groundController.addGroundImage)

// Ground slot routes
router.get("/grounds/:groundId/slots", groundController.getGroundSlots)
router.post("/grounds/:groundId/slots", authenticate, groundController.createSlot)
router.patch("/slots/:slotId", authenticate, groundController.updateSlot)
router.delete("/slots/:slotId", authenticate, groundController.deleteSlot)

// Ground slot generation route
router.post("/grounds/:groundId/generate-slots", authenticate, groundController.generateSlotsForDate)

// Slot booking routes
router.post("/slots/:slotId/book", authenticate, groundController.bookSlot)
router.post("/slots/:slotId/cancel", authenticate, groundController.cancelBooking)
router.patch("/slots/:slotId/payment", authenticate, groundController.updatePaymentStatus)

// Ground review routes
router.get("/grounds/:groundId/reviews", groundController.getGroundReviews)

// Ground dashboard route
router.get("/grounds/:groundId/dashboard", authenticate, groundController.getGroundDashboard)

module.exports = router
