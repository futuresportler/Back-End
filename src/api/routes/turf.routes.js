const express = require("express");
const router = express.Router();
const turfController = require("../controllers/turf.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateTurfProfile,
  validateRequest,
} = require("../validation/turfValidator");

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
router.patch(
  "/:turfProfileId",
  authMiddleware,
  validateTurfProfile,
  validateRequest,
  turfController.updateProfile
);
router.delete("/:turfProfileId", authMiddleware, turfController.deleteProfile);

// Search routes
router.get("/nearby", turfController.getNearbyTurfs);

// Image routes
router.post("/:turfProfileId/images", authMiddleware, turfController.addImage);

module.exports = router;
