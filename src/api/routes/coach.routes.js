const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coach.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateRequest,
  validateCreateBatch,
  validateUpdateBatch,
  validateAddStudentToBatch,
  validateCreateBatchPayment,
} = require("../validation/coachValidator");

// Add this new route
router.get("/", coachController.searchCoaches);

// New endpoint to fetch student achievements/feedback
router.get("/students/data", authMiddleware, coachController.getStudentData);

// New endpoint to fetch coaches by user
router.get("/by-user/:userId", coachController.getCoachesByUser);

// Profile routes
router.get("/nearby", coachController.getNearbyCoaches);
router.get("/me", authMiddleware, coachController.getMyProfile);
router.get("/:coachProfileId", coachController.getProfile);
router.patch("/:coachProfileId", authMiddleware, coachController.updateProfile);
router.delete(
  "/:coachProfileId",
  authMiddleware,
  coachController.deleteProfile
);

// Certification routes
router.post(
  "/:coachProfileId/certifications",
  authMiddleware,
  coachController.addCertification
);

// Batch routes
router.post(
  "/:coachProfileId/batches",
  authMiddleware,
  validateCreateBatch,
  validateRequest,
  coachController.createBatch
);
router.get("/:coachProfileId/batches", coachController.getCoachBatches);
router.get("/batches/:batchId", coachController.getBatch);
router.patch(
  "/batches/:batchId",
  authMiddleware,
  validateUpdateBatch,
  validateRequest,
  coachController.updateBatch
);
router.delete("/batches/:batchId", authMiddleware, coachController.deleteBatch);

// Batch student routes
router.get("/batches/:batchId/students", coachController.getBatchStudents);
router.post(
  "/batches/:batchId/students",
  authMiddleware,
  validateAddStudentToBatch,
  validateRequest,
  coachController.addStudentToBatch
);
router.delete(
  "/batches/:batchId/students/:userId",
  authMiddleware,
  coachController.removeStudentFromBatch
);

// Batch payment routes
router.get(
  "/batches/:batchId/payments",
  authMiddleware,
  coachController.getBatchPayments
);
router.post(
  "/batches/:batchId/payments",
  authMiddleware,
  validateCreateBatchPayment,
  validateRequest,
  coachController.createBatchPayment
);

// Add promotion-related route
router.get(
  "/:coachProfileId/with-promotion",
  coachController.getProfileWithPromotion
);

// Analytics routes
router.get(
  "/:coachId/analytics/monthly",
  authMiddleware,
  coachController.getMonthlyAnalytics
);
router.get(
  "/batches/:batchId/analytics/monthly",
  authMiddleware,
  coachController.getBatchMonthlyAnalytics
);
router.get(
  "/:coachId/analytics/:monthId",
  authMiddleware,
  coachController.getDetailedMonthlyAnalytics
);
router.get(
  "/batches/:batchId/analytics/:monthId",
  authMiddleware,
  coachController.getDetailedBatchAnalytics
);
router.post(
  "/:coachId/analytics/:monthId/refresh",
  authMiddleware,
  coachController.refreshAnalytics
);

// Score tracking routes
router.get(
  "/:coachId/students/:studentId/scores",
  authMiddleware,
  coachController.getStudentScoreHistory
);
router.put(
  "/:coachId/students/:studentId/scores",
  authMiddleware,
  coachController.updateStudentScore
);
router.get(
  "/:coachId/students/scores",
  authMiddleware,
  coachController.getStudentsWithScores
);
router.put(
  "/:coachId/students/scores/bulk",
  authMiddleware,
  coachController.bulkUpdateStudentScores
);

// Batch score analytics
router.get(
  "/batches/:batchId/scores/analytics",
  authMiddleware,
  coachController.getBatchScoreAnalytics
);

// Coach effectiveness and reports
router.get(
  "/:coachId/effectiveness-report",
  authMiddleware,
  coachController.getCoachEffectivenessReport
);

// Quarterly progress tracking routes
router.get(
  "/:coachId/students/:studentId/progress",
  authMiddleware,
  coachController.getStudentQuarterlyProgress
);
router.put(
  "/:coachId/students/:studentId/progress/:year/:quarter",
  authMiddleware,
  coachController.updateStudentQuarterlyProgress
);

// Coaching plan management
router.put(
  "/:coachId/students/:studentId/coaching-plan",
  authMiddleware,
  coachController.updateStudentCoachingPlan
);

// Performance metrics
router.put(
  "/:coachId/students/:studentId/performance-metrics",
  authMiddleware,
  coachController.updateStudentPerformanceMetrics
);

// Progress analytics
router.get(
  "/:coachId/progress/analytics",
  authMiddleware,
  coachController.getCoachProgressAnalytics
);

// Progress reports
router.get(
  "/:coachId/students/:studentId/reports/:year/:quarter",
  authMiddleware,
  coachController.generateStudentProgressReport
);
router.get(
  "/batches/:batchId/progress-summary/:year/:quarter",
  authMiddleware,
  coachController.getBatchProgressSummary
);

module.exports = router;
