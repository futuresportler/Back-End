const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateCreateFeedback,
  validateQueryParams,
  validateEntityParams,
} = require("../validation/feedbackValidator");

// ============ ANALYTICS & OVERVIEW ROUTES ============
// Universal analytics route for all entity types
router.get(
  "/analytics/:entityType/:entityId",
  authMiddleware,
  validateEntityParams,
  validateQueryParams,
  feedbackController.getFeedbackAnalytics
);

// Recent feedback for any entity
router.get(
  "/recent/:entityType/:entityId",
  authMiddleware,
  validateEntityParams,
  validateQueryParams,
  feedbackController.getRecentFeedback
);

// ============ HIERARCHICAL FEEDBACK ROUTES ============
// Academy's sub-entities feedback
router.get(
  "/academy/:academyId/coaches",
  authMiddleware,
  validateQueryParams,
  feedbackController.getAcademyCoachFeedback
);

router.get(
  "/academy/:academyId/students",
  authMiddleware,
  validateQueryParams,
  feedbackController.getAcademyStudentFeedback
);

router.get(
  "/academy/:academyId/batches",
  authMiddleware,
  validateQueryParams,
  feedbackController.getAcademyBatchFeedback
);

router.get(
  "/academy/:academyId/programs",
  authMiddleware,
  validateQueryParams,
  feedbackController.getAcademyProgramFeedback
);

// Coach's sub-entities feedback
router.get(
  "/coach/:coachId/students",
  authMiddleware,
  validateQueryParams,
  feedbackController.getCoachStudentFeedback
);

router.get(
  "/coach/:coachId/batches",
  authMiddleware,
  validateQueryParams,
  feedbackController.getCoachBatchFeedback
);

// ============ DIRECT ENTITY FEEDBACK ROUTES ============
router.get(
  "/entity/:entityType/:entityId",
  authMiddleware,
  validateEntityParams,
  validateQueryParams,
  feedbackController.getEntityFeedback
);

// ============ CREATE FEEDBACK ROUTES ============
router.post(
  "/entity/:entityType/:entityId",
  authMiddleware,
  validateEntityParams,
  validateCreateFeedback,
  feedbackController.createEntityFeedback
);

// ============ PROGRESS TRACKING FEEDBACK ROUTES ============
router.post(
  "/progress/:entityType/:entityId",
  authMiddleware,
  validateEntityParams,
  validateCreateFeedback,
  feedbackController.createProgressTrackingFeedback
);

router.get(
  "/progress/:entityType/:entityId/quarterly/:year/:quarter",
  authMiddleware,
  validateEntityParams,
  validateQueryParams,
  feedbackController.getQuarterlyProgressFeedback
);

router.get(
  "/progress/:entityType/:entityId/prompts",
  authMiddleware,
  validateEntityParams,
  feedbackController.generateProgressFeedbackPrompts
);

router.get(
  "/progress/:entityType/:entityId/trends",
  authMiddleware,
  validateEntityParams,
  validateQueryParams,
  feedbackController.analyzeProgressFeedbackTrends
);

module.exports = router;
