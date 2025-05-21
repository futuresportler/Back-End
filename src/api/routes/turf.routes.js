const express = require("express");
const router = express.Router();
const turfController = require("../controllers/turf.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateTurfProfile,
  validateRequest,
} = require("../validation/turfValidator");

// Add this new route
router.get("/", turfController.searchTurfs);

// Profile routes
router.post(
  "/",
  authMiddleware,
  validateTurfProfile,
  validateRequest,
  turfController.createProfile
);
router.get("/my-turfs", authMiddleware, turfController.getMyProfiles);
router.get("/:turfProfileId", turfController.getProfile);
router.patch("/:turfProfileId", authMiddleware, turfController.updateProfile);
router.delete("/:turfProfileId", authMiddleware, turfController.deleteProfile);

// Dashboard route
router.get(
  "/:turfProfileId/dashboard",
  authMiddleware,
  turfController.getDashboard
);

// Search routes
router.get("/nearby", turfController.getNearbyTurfs);

// Image routes
router.post("/:turfProfileId/images", authMiddleware, turfController.addImage);

// Booking request routes
router.post(
  "/booking-requests/:requestId",
  authMiddleware,
  turfController.handleBookingRequest
);

// Review routes
router.post(
  "/:turfProfileId/reviews",
  authMiddleware,
  turfController.addReview
);

// Analytics routes
router.get("/:turfId/metrics/monthly", authMiddleware, turfController.getMonthlyMetrics);
router.get("/:turfId/metrics/:monthId/utilization", authMiddleware, turfController.getUtilizationRate);
router.get("/:turfId/metrics/:monthId/revenue-by-sport", authMiddleware, turfController.getRevenueBySort);
router.get("/:turfId/metrics/:monthId/hourly-bookings", authMiddleware, turfController.getHourlyBookings);
router.get("/:turfId/metrics/:monthId/daily-bookings", authMiddleware, turfController.getDailyBookings);
router.get("/:turfId/metrics/:monthId/ground-metrics", authMiddleware, turfController.getGroundMetrics);
router.post("/:turfId/metrics/:monthId/refresh", authMiddleware, turfController.refreshMetrics);

module.exports = router;
