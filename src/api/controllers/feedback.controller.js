const feedbackService = require("../../services/feedback");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

// ============ UNIVERSAL ENTITY FEEDBACK CONTROLLER ============

const getEntityFeedback = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const feedback = await feedbackService.getEntityFeedback(
      entityType,
      entityId,
      req.query
    );
    successResponse(
      res,
      `${entityType} feedback fetched successfully`,
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createEntityFeedback = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createEntityFeedback(
      entityType,
      entityId,
      req.body,
      userId
    );
    successResponse(
      res,
      `${entityType} feedback created successfully`,
      feedback,
      201
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ HIERARCHICAL FEEDBACK CONTROLLERS ============

const getAcademyCoachFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyCoachFeedback(
      academyId,
      req.query
    );
    successResponse(
      res,
      "Academy coach feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyStudentFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyStudentFeedback(
      academyId,
      req.query
    );
    successResponse(
      res,
      "Academy student feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyBatchFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyBatchFeedback(
      academyId,
      req.query
    );
    successResponse(
      res,
      "Academy batch feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyProgramFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyProgramFeedback(
      academyId,
      req.query
    );
    successResponse(
      res,
      "Academy program feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachStudentFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const feedback = await feedbackService.getCoachStudentFeedback(
      coachId,
      req.query
    );
    successResponse(
      res,
      "Coach student feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachBatchFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const feedback = await feedbackService.getCoachBatchFeedback(
      coachId,
      req.query
    );
    successResponse(res, "Coach batch feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ ANALYTICS CONTROLLERS ============

const getFeedbackAnalytics = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const analytics = await feedbackService.getFeedbackAnalytics(
      entityType,
      entityId
    );
    successResponse(res, "Feedback analytics fetched successfully", analytics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getRecentFeedback = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 5 } = req.query;
    const feedback = await feedbackService.getRecentFeedback(
      entityType,
      entityId,
      parseInt(limit)
    );
    successResponse(res, "Recent feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ PROGRESS TRACKING FEEDBACK CONTROLLERS ============

const createProgressTrackingFeedback = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { userId } = req.user;
    const progressFeedbackData = req.body;

    const feedback = await feedbackService.createProgressTrackingFeedback(
      entityType,
      entityId,
      progressFeedbackData,
      userId
    );

    successResponse(
      res,
      "Progress tracking feedback created successfully",
      feedback,
      201
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getQuarterlyProgressFeedback = async (req, res) => {
  try {
    const { entityType, entityId, year, quarter } = req.params;
    const filters = req.query;

    const feedback = await feedbackService.getQuarterlyProgressFeedback(
      entityType,
      entityId,
      year,
      quarter,
      filters
    );

    successResponse(
      res,
      "Quarterly progress feedback fetched successfully",
      feedback
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const generateProgressFeedbackPrompts = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const progressData = req.body;

    const prompts = await feedbackService.generateProgressFeedbackPrompts(
      entityType,
      entityId,
      progressData
    );

    successResponse(
      res,
      "Progress feedback prompts generated successfully",
      prompts
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const analyzeProgressFeedbackTrends = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { timeframe = 6 } = req.query;

    const trends = await feedbackService.analyzeProgressFeedbackTrends(
      entityType,
      entityId,
      parseInt(timeframe)
    );

    successResponse(
      res,
      "Progress feedback trends analyzed successfully",
      trends
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  // Universal entity controllers
  getEntityFeedback,
  createEntityFeedback,

  // Hierarchical feedback controllers
  getAcademyCoachFeedback,
  getAcademyStudentFeedback,
  getAcademyBatchFeedback,
  getAcademyProgramFeedback,
  getCoachStudentFeedback,
  getCoachBatchFeedback,

  // Analytics controllers
  getFeedbackAnalytics,
  getRecentFeedback,

  // Progress tracking feedback controllers
  createProgressTrackingFeedback,
  getQuarterlyProgressFeedback,
  generateProgressFeedbackPrompts,
  analyzeProgressFeedbackTrends,
};
