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

// New endpoint to fetch student achievements/feedback
router.get("/students/data", authMiddleware, academyController.getStudentData);

// New endpoint to fetch academies by user
router.get("/by-user/:userId", academyController.getAcademiesByUser);

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

// Inquiries
router.post("/inquiries", academyController.createInquiry);
router.get("/:academyId/inquiries", authMiddleware, academyController.getInquiries);

module.exports = router;
