const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coach.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateCoachProfile,
  validateRequest,
} = require("../validation/coachValidator");

// Profile routes
router.post(
  "/",
  authMiddleware,
  validateCoachProfile,
  validateRequest,
  coachController.createProfile
);
router.get("/me", authMiddleware, coachController.getMyProfile);
router.get("/:coachProfileId", coachController.getProfile);
router.patch(
  "/:coachProfileId",
  authMiddleware,
  validateCoachProfile,
  validateRequest,
  coachController.updateProfile
);
router.delete(
  "/:coachProfileId",
  authMiddleware,
  coachController.deleteProfile
);

// Search routes
router.get("/nearby", coachController.getNearbyCoaches);

// Certification routes
router.post(
  "/:coachProfileId/certifications",
  authMiddleware,
  coachController.addCertification
);

module.exports = router;
