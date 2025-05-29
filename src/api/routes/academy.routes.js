const express = require("express");
const router = express.Router();
const academyController = require("../controllers/academy.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateAcademyProfile,
  validateRequest,
} = require("../validation/academyValidator");

// Search routes - IMPORTANT: This must be before any routes with path parameters
router.get("/", academyController.searchAcademies);
router.get("/nearby", academyController.getNearbyAcademies);

// New bulk import route - Add this at the top to avoid path parameter conflicts
router.get(
  "/import-archery/:password/:supplierId",
  academyController.bulkImportArcheryAcademies
);

// New endpoint to fetch student achievements/feedback
router.get("/students/data", authMiddleware, academyController.getStudentData);

// New endpoint to fetch academies by user
router.get("/by-user/:userId", academyController.getAcademiesByUser);

// Add promotion-related route
router.get(
  "/:academyProfileId/with-promotion",
  academyController.getProfileWithPromotion
);

// Profile routes
router.get("/:academyProfileId", academyController.getProfile);
router.patch(
  "/:academyProfileId",
  authMiddleware,
  academyController.updateProfile
);
router.delete(
  "/:academyProfileId",
  authMiddleware,
  academyController.deleteProfile
);
router.get(
  "/:academyId/coach-feedback",
  authMiddleware,
  academyController.getAcademyCoachFeedback
);
router.get(
  "/:academyId/booking-platforms",
  authMiddleware,
  academyController.getBookingPlatforms
);
router.get(
  "/:academyId/popular-programs",
  authMiddleware,
  academyController.getPopularPrograms
);
// Student routes
router.get(
  "/:academyId/students",
  authMiddleware,
  academyController.getAcademyStudents
);
router.get(
  "/students/:studentId",
  authMiddleware,
  academyController.getStudent
);
router.post("/students", authMiddleware, academyController.createStudent);
router.patch(
  "/students/:studentId",
  authMiddleware,
  academyController.updateStudent
);
router.delete(
  "/students/:studentId",
  authMiddleware,
  academyController.deleteStudent
);

// Batch routes
router.post("/batches", authMiddleware, academyController.createBatch);
router.get("/batches/available", academyController.getAvailableBatches);
router.get("/batches/:batchId", academyController.getBatch);
router.get("/:academyId/batches", academyController.getAcademyBatches);
router.patch(
  "/batches/:batchId",
  authMiddleware,
  academyController.updateBatch
);
router.delete(
  "/batches/:batchId",
  authMiddleware,
  academyController.deleteBatch
);
router.get(
  "/batches/:batchId/students",
  authMiddleware,
  academyController.getBatchStudents
);
router.post(
  "/batches/:batchId/students",
  authMiddleware,
  academyController.enrollStudentInBatch
);
router.delete(
  "/batches/:batchId/students/:studentId",
  authMiddleware,
  academyController.unEnrollStudentFromBatch
);

// Program routes
router.post("/programs", authMiddleware, academyController.createProgram);
router.get("/programs/:programId", academyController.getProgram);
router.get("/:academyId/programs", academyController.getAcademyPrograms);
router.patch(
  "/programs/:programId",
  authMiddleware,
  academyController.updateProgram
);
router.delete(
  "/programs/:programId",
  authMiddleware,
  academyController.deleteProgram
);
router.get(
  "/programs/:programId/students",
  authMiddleware,
  academyController.getProgramStudents
);
router.post(
  "/programs/:programId/students",
  authMiddleware,
  academyController.enrollStudentInProgram
);
router.delete(
  "/programs/:programId/students/:studentId",
  authMiddleware,
  academyController.unEnrollStudentFromProgram
);

// Fee routes
router.post("/fees", authMiddleware, academyController.createFee);
router.get("/fees/:feeId", authMiddleware, academyController.getFee);
router.get(
  "/student/:studentId/fees",
  authMiddleware,
  academyController.getStudentFees
);
router.get(
  "/:academyId/fees",
  authMiddleware,
  academyController.getAcademyFees
);
router.patch("/fees/:feeId", authMiddleware, academyController.updateFee);
router.delete("/fees/:feeId", authMiddleware, academyController.deleteFee);
router.post(
  "/fees/:feeId/payment",
  authMiddleware,
  academyController.recordPayment
);
router.get("/fees/overdue", authMiddleware, academyController.getOverdueFees);

// Metrics routes - Add these after your existing routes, before module.exports
router.post("/profile-views", authMiddleware, academyController.recordProfileView);
router.get("/:academyId/metrics/monthly", authMiddleware, academyController.getMonthlyMetrics);
router.get("/programs/:programId/metrics/:monthId", authMiddleware, academyController.getProgramMonthlyMetrics);
router.get("/:academyId/conversion-rate/:monthId", authMiddleware, academyController.getConversionRate);
router.post(
  "/:academyId/metrics/:monthId/refresh",
  authMiddleware,
  academyController.refreshMetrics
);
router.post(
  "/profile-views",
  authMiddleware,
  academyController.recordProfileView
);
router.get(
  "/:academyId/metrics/monthly",
  authMiddleware,
  academyController.getMonthlyMetrics
);
router.get(
  "/programs/:programId/metrics/:monthId",
  authMiddleware,
  academyController.getProgramMonthlyMetrics
);
router.get(
  "/:academyId/conversion-rate/:monthId",
  authMiddleware,
  academyController.getConversionRate
);

// Inquiries
router.post("/inquiries", academyController.createInquiry);
router.get(
  "/:academyId/inquiries",
  authMiddleware,
  academyController.getInquiries
);

// Add Academy Coach routes
// CRUD routes for academy coaches
router.post(
  "/:academyId/coaches",
  authMiddleware,
  academyController.createAcademyCoach
);
router.get("/coaches/:coachId", academyController.getAcademyCoach);
router.get("/:academyId/coaches", academyController.getAcademyCoaches);
router.patch(
  "/coaches/:coachId",
  authMiddleware,
  academyController.updateAcademyCoach
);
router.delete(
  "/coaches/:coachId",
  authMiddleware,
  academyController.deleteAcademyCoach
);

// Batch assignment routes
router.post(
  "/coaches/:coachId/batches",
  authMiddleware,
  academyController.assignCoachToBatch
);
router.delete(
  "/coaches/:coachId/batches/:batchId",
  authMiddleware,
  academyController.removeCoachFromBatch
);

// Program assignment routes
router.post(
  "/coaches/:coachId/programs",
  authMiddleware,
  academyController.assignCoachToProgram
);
router.delete(
  "/coaches/:coachId/programs/:programId",
  authMiddleware,
  academyController.removeCoachFromProgram
);

// Get coach's batches and programs
router.get(
  "/coaches/:coachId/assignments",
  academyController.getCoachBatchesAndPrograms
);

// Get coach schedule
router.get("/coaches/:coachId/schedule", academyController.getCoachSchedule);

// Sync coaches with platform
router.post(
  "/:academyId/coaches/sync",
  authMiddleware,
  academyController.syncCoachesWithPlatform
);

module.exports = router;
