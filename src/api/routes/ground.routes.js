const express = require("express")
const router = express.Router()
const groundController = require("../controllers/ground.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")

// Ground CRUD routes
router.post("/turf/:turfId/grounds", authMiddleware, groundController.createGround)
router.get("/grounds/:groundId", groundController.getGround)
router.get("/turf/:turfId/grounds", groundController.getGroundsByTurf)
router.patch("/grounds/:groundId", authMiddleware, groundController.updateGround)
router.delete("/grounds/:groundId", authMiddleware, groundController.deleteGround)

// Ground image routes
router.post("/grounds/:groundId/images", authMiddleware, groundController.addGroundImage)

// Ground slot routes
router.get("/grounds/:groundId/slots", groundController.getGroundSlots)
router.post("/grounds/:groundId/slots", authMiddleware, groundController.createSlot)
router.patch("/slots/:slotId", authMiddleware, groundController.updateSlot)
router.delete("/slots/:slotId", authMiddleware, groundController.deleteSlot)

// Ground review routes
router.get("/grounds/:groundId/reviews", groundController.getGroundReviews)

// Ground dashboard route
router.get("/grounds/:groundId/dashboard", authMiddleware, groundController.getGroundDashboard)

module.exports = router
