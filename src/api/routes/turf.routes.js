const express = require("express")
const router = express.Router()
const turfController = require("../controllers/turf.controller")
const { authMiddleware } = require("../middlewares/auth.middleware")
const { validateTurfProfile, validateRequest } = require("../validation/turfValidator")

// Profile routes
router.post("/", authMiddleware, validateTurfProfile, validateRequest, turfController.createProfile)
router.get("/my-turfs", authMiddleware, turfController.getMyProfiles)
router.get("/:turfProfileId", turfController.getProfile)
router.patch("/:turfProfileId", authMiddleware, turfController.updateProfile)
router.delete("/:turfProfileId", authMiddleware, turfController.deleteProfile)

// Dashboard route
router.get("/:turfProfileId/dashboard", authMiddleware, turfController.getDashboard)

// Search routes
router.get("/nearby", turfController.getNearbyTurfs)

// Image routes
router.post("/:turfProfileId/images", authMiddleware, turfController.addImage)

// Booking request routes
router.post("/booking-requests/:requestId", authMiddleware, turfController.handleBookingRequest)

// Review routes
router.post("/:turfProfileId/reviews", authMiddleware, turfController.addReview)

module.exports = router
