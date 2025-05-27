const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { validateCreateFeedback, validateQueryParams, validateEntityParams } = require("../validation/feedbackValidator");


// ============ ANALYTICS ROUTES (MUST BE FIRST) ============
router.get("/analytics/:entityType/:entityId", 
  authMiddleware, 
  validateEntityParams, 
  validateQueryParams, 
  feedbackController.getFeedbackAnalytics
);

router.get("/recent/:entityType/:entityId", 
  authMiddleware, 
  validateEntityParams, 
  validateQueryParams, 
  feedbackController.getRecentFeedback
);

// ============ ACADEMY FEEDBACK ROUTES ============
router.get("/academy/:academyId/overview", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getAcademyFeedback
);

router.get("/academy/:academyId/coaches", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getAcademyCoachFeedback
);

router.get("/academy/:academyId/students", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getAcademyStudentFeedback
);

router.get("/academy/:academyId/batches", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getAcademyBatchFeedback
);

router.get("/academy/:academyId/programs", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getAcademyProgramFeedback
);

// ============ COACH FEEDBACK ROUTES ============
router.get("/coach/:coachId/overview", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getCoachFeedback
);

router.get("/coach/:coachId/students", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getCoachStudentFeedback
);

router.get("/coach/:coachId/batches", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getCoachBatchFeedback
);

// ============ ENTITY-SPECIFIC ROUTES ============
router.get("/entity/student/:studentId", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getStudentFeedback
);

router.get("/entity/batch/:batchId", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getBatchFeedback
);

router.get("/entity/program/:programId", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getProgramFeedback
);

router.get("/entity/session/:sessionId", 
  authMiddleware, 
  validateQueryParams, 
  feedbackController.getSessionFeedback
);

// ============ CREATE FEEDBACK ROUTES ============
router.post("/academy/:academyId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createAcademyFeedback
);

router.post("/coach/:coachId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createCoachFeedback
);

router.post("/entity/student/:studentId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createStudentFeedback
);

router.post("/entity/batch/:batchId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createBatchFeedback
);

router.post("/entity/program/:programId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createProgramFeedback
);

router.post("/entity/session/:sessionId", 
  authMiddleware, 
  validateCreateFeedback, 
  feedbackController.createSessionFeedback
);

module.exports = router;