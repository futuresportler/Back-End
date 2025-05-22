const feedbackService = require("../../services/feedback");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

// ============ GET FEEDBACK CONTROLLERS ============

const getAcademyFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyFeedback(academyId, req.query);
    successResponse(res, "Academy feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyCoachFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyCoachFeedback(academyId, req.query);
    successResponse(res, "Academy coach feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyStudentFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyStudentFeedback(academyId, req.query);
    successResponse(res, "Academy student feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyBatchFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyBatchFeedback(academyId, req.query);
    successResponse(res, "Academy batch feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyProgramFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const feedback = await feedbackService.getAcademyProgramFeedback(academyId, req.query);
    successResponse(res, "Academy program feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const feedback = await feedbackService.getCoachFeedback(coachId, req.query);
    successResponse(res, "Coach feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachStudentFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const feedback = await feedbackService.getCoachStudentFeedback(coachId, req.query);
    successResponse(res, "Coach student feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachBatchFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const feedback = await feedbackService.getCoachBatchFeedback(coachId, req.query);
    successResponse(res, "Coach batch feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const feedback = await feedbackService.getStudentFeedback(studentId, req.query);
    successResponse(res, "Student feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchFeedback = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { batchType = 'academy' } = req.query;
    const feedback = await feedbackService.getBatchFeedback(batchId, batchType, req.query);
    successResponse(res, "Batch feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProgramFeedback = async (req, res) => {
  try {
    const { programId } = req.params;
    const feedback = await feedbackService.getProgramFeedback(programId, req.query);
    successResponse(res, "Program feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const feedback = await feedbackService.getSessionFeedback(sessionId, req.query);
    successResponse(res, "Session feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ CREATE FEEDBACK CONTROLLERS ============

const createAcademyFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createAcademyFeedback(academyId, req.body, userId);
    successResponse(res, "Academy feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createCoachFeedback = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createCoachFeedback(coachId, req.body, userId);
    successResponse(res, "Coach feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createStudentFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createStudentFeedback(studentId, req.body, userId);
    successResponse(res, "Student feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createBatchFeedback = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createBatchFeedback(batchId, req.body, userId);
    successResponse(res, "Batch feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createProgramFeedback = async (req, res) => {
  try {
    const { programId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createProgramFeedback(programId, req.body, userId);
    successResponse(res, "Program feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.user;
    const feedback = await feedbackService.createSessionFeedback(sessionId, req.body, userId);
    successResponse(res, "Session feedback created successfully", feedback, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ ANALYTICS CONTROLLERS ============

const getFeedbackAnalytics = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const analytics = await feedbackService.getFeedbackAnalytics(entityType, entityId);
    successResponse(res, "Feedback analytics fetched successfully", analytics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getRecentFeedback = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 5 } = req.query;
    const feedback = await feedbackService.getRecentFeedback(entityType, entityId, parseInt(limit));
    successResponse(res, "Recent feedback fetched successfully", feedback);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  // Get feedback exports
  getAcademyFeedback,
  getAcademyCoachFeedback,
  getAcademyStudentFeedback,
  getAcademyBatchFeedback,
  getAcademyProgramFeedback,
  getCoachFeedback,
  getCoachStudentFeedback,
  getCoachBatchFeedback,
  getStudentFeedback,
  getBatchFeedback,
  getProgramFeedback,
  getSessionFeedback,
  
  // Create feedback exports
  createAcademyFeedback,
  createCoachFeedback,
  createStudentFeedback,
  createBatchFeedback,
  createProgramFeedback,
  createSessionFeedback,
  
  // Analytics exports
  getFeedbackAnalytics,
  getRecentFeedback,
};