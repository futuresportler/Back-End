const express = require("express");
const {
  ScoreController,
  CoachScoreController,
  AcademyScoreController,
  AcademyCoachScoreController,
  UserScoreController,
} = require("../controllers/score.controller");
const achievementService = require("../../services/score/achievementService");
const {
  authenticate,
  authorize,
  refreshMiddleWare,
  authMiddleware,
} = require("../middlewares/auth.middleware");
const {
  validateScore,
  validateScorePermissions,
} = require("../validation/scoreValidation");

const router = express.Router();

// --- Public routes (sports config) ---
router.get("/sports", ScoreController.getSportsConfig);
router.get("/sports/:sport/flags", ScoreController.getSportFlags);

// --- Score routes (require authentication) ---
router.use(authenticate);

// Student score management
router.post(
  "/students/:studentId",
  validateScore,
  validateScorePermissions,
  ScoreController.updateStudentScore
);
router.post(
  "/students/bulk",
  validateScore,
  validateScorePermissions,
  ScoreController.bulkUpdateScores
);

// Score analytics
router.get(
  "/students/:studentId/analytics",
  ScoreController.getStudentScoreAnalytics
);
router.get(
  "/batches/:batchId/analytics",
  ScoreController.getBatchScoreAnalytics
);
router.get(
  "/programs/:programId/analytics",
  ScoreController.getProgramScoreAnalytics
);

// Coach effectiveness
router.get(
  "/coaches/:coachId/effectiveness",
  ScoreController.getCoachEffectivenessReport
);

// Achievement system
router.post(
  "/students/:studentId/achievements",
  ScoreController.awardAchievement
);

// Analytics
router.get(
  "/:entityType/:entityId/distribution",
  ScoreController.getScoreDistribution
);
router.get(
  "/:entityType/:entityId/top-performers",
  ScoreController.getTopPerformers
);

// --- Coach Score routes (require supplier & coach auth) ---
router.use("/coaches", authenticate);

router.get(
  "/coaches/:coachId/students",
  CoachScoreController.getStudentsWithScores
);
router.post(
  "/coaches/:coachId/students/:studentId/scores",
  validateScore,
  validateScorePermissions,
  CoachScoreController.updateStudentScore
);
router.post(
  "/coaches/:coachId/students/bulk-scores",
  validateScore,
  validateScorePermissions,
  CoachScoreController.bulkUpdateStudentScores
);
router.get(
  "/coaches/:coachId/students/:studentId/history",
  CoachScoreController.getStudentScoreHistory
);
router.get(
  "/coaches/:coachId/batches/:batchId/analytics",
  CoachScoreController.getBatchScoreAnalytics
);
router.get(
  "/coaches/:coachId/effectiveness",
  CoachScoreController.getEffectivenessReport
);
router.get(
  "/coaches/:coachId/summary",
  CoachScoreController.getCoachScoreSummary
);

// --- Academy Score routes (require supplier auth) ---
router.use("/academy", authenticate);

// Academy-level score management
router.get(
  "/academy/:academyId/students",
  authenticate,
  AcademyScoreController.getStudentsWithScores
);
router.post(
  "/academy/:academyId/students/:studentId/scores",
  authenticate,
  validateScore,
  validateScorePermissions,
  AcademyScoreController.updateStudentScore
);
router.post(
  "/academy/:academyId/students/bulk-scores",
  authenticate,
  validateScore,
  validateScorePermissions,
  AcademyScoreController.bulkUpdateStudentScores
);

// Student analytics
router.get(
  "/academy/:academyId/students/:studentId/analytics",
  authenticate,
  AcademyScoreController.getStudentScoreAnalytics
);

// Batch and program analytics
router.get(
  "/academy/:academyId/batches/:batchId/analytics",
  authenticate,
  AcademyScoreController.getBatchScoreAnalytics
);
router.get(
  "/academy/:academyId/programs/:programId/analytics",
  authenticate,
  AcademyScoreController.getProgramScoreAnalytics
);

// Achievement system
router.post(
  "/academy/:academyId/students/:studentId/achievements",
  authenticate,
  AcademyScoreController.awardStudentAchievement
);

// Academy overview and insights
router.get(
  "/academy/:academyId/overview",
  authenticate,
  AcademyScoreController.getAcademyScoreOverview
);
router.get(
  "/academy/:academyId/trends",
  authenticate,
  AcademyScoreController.getScoreTrends
);
router.get(
  "/academy/:academyId/insights",
  authenticate,
  AcademyScoreController.getScoreInsights
);

// --- Academy Coach-specific routes ---
router.get(
  "/academy/coaches/:coachId/students",
  AcademyCoachScoreController.getMyStudentsWithScores
);
router.post(
  "/academy/coaches/:coachId/students/:studentId/scores",
  validateScore,
  validateScorePermissions,
  AcademyCoachScoreController.updateStudentScore
);
router.post(
  "/academy/coaches/:coachId/students/bulk-scores",
  validateScore,
  validateScorePermissions,
  AcademyCoachScoreController.bulkUpdateStudentScores
);
router.get(
  "/academy/coaches/:coachId/effectiveness",
  AcademyCoachScoreController.getCoachScoreEffectiveness
);
router.get(
  "/academy/coaches/:coachId/batches/:batchId/analytics",
  AcademyCoachScoreController.getBatchScoreAnalytics
);
router.get(
  "/academy/coaches/:coachId/programs/:programId/analytics",
  AcademyCoachScoreController.getProgramScoreAnalytics
);
router.get(
  "/academy/coaches/:coachId/entities",
  AcademyCoachScoreController.getAssignedEntitiesWithScores
);
router.post(
  "/academy/coaches/:coachId/students/:studentId/achievements",
  AcademyCoachScoreController.awardStudentAchievement
);

// --- Achievement routes (require score access auth) ---
router.use("/achievements", authenticate);

router.get("/achievements/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { studentType } = req.query;

    if (!studentType) {
      return res.status(400).json({
        success: false,
        message: "studentType query parameter is required",
      });
    }

    const achievements = await achievementService.getStudentAchievements(
      studentId,
      studentType
    );

    res.status(200).json({
      success: true,
      data: {
        studentId,
        studentType,
        achievements,
        total: achievements.length,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/achievements/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { studentType, achievement } = req.body;

    if (!studentType || !achievement) {
      return res.status(400).json({
        success: false,
        message: "studentType and achievement are required",
      });
    }

    const result = await achievementService.awardAchievement(
      studentId,
      studentType,
      achievement
    );

    res.status(200).json({
      success: true,
      message: "Achievement awarded successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/achievements/:entityType/:entityId/report", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    if (!["batch", "program", "academy"].includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entityType. Must be: batch, program, or academy",
      });
    }

    const report = await achievementService.generateAchievementReport(
      entityType,
      entityId
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// --- User Score routes (require authentication) ---
router.use("/users", authenticate);

// User score management
router.get(
  "/users/:userId",
  UserScoreController.getUserScores
);
router.post(
  "/users/:userId/scores",
  validateScore,
  UserScoreController.updateUserScore
);
router.get(
  "/users/:userId/history",
  UserScoreController.getUserScoreHistory
);
router.get(
  "/users/:userId/analytics",
  UserScoreController.getUserScoreAnalytics
);

// User achievements
router.post(
  "/users/:userId/achievements",
  UserScoreController.awardUserAchievement
);

// User progress tracking
router.get(
  "/users/:userId/progress",
  UserScoreController.getUserProgressTracking
);
router.post(
  "/users/:userId/progress",
  UserScoreController.updateUserProgressTracking
);
router.get(
  "/users/:userId/progress/report",
  UserScoreController.generateUserProgressReport
);
router.get(
  "/users/:userId/milestones",
  UserScoreController.trackUserMilestones
);


module.exports = router;
