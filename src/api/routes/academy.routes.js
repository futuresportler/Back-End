const express = require("express");
const router = express.Router();
const academyController = require("../controllers/academy.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateAcademyProfile,
  validateRequest,
} = require("../validation/academyValidator");

// Profile routes
router.post(
  "/",
  authMiddleware,
  validateAcademyProfile,
  validateRequest,
  academyController.createProfile
);
router.get("/my-academies", authMiddleware, academyController.getMyProfiles);
router.get("/:academyProfileId", academyController.getProfile);
router.patch(
  "/:academyProfileId",
  authMiddleware,
  validateAcademyProfile,
  validateRequest,
  academyController.updateProfile
);
router.delete(
  "/:academyProfileId",
  authMiddleware,
  academyController.deleteProfile
);

// Search routes
router.get("/nearby", academyController.getNearbyAcademies);

// Sport routes
router.post(
  "/:academyProfileId/sports",
  authMiddleware,
  academyController.addSport
);

module.exports = router;
