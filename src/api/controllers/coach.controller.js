const coachService = require("../../services/coach");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const getMyProfile = async (req, res) => {
  try {
    const profile = await coachService.getCoachBySupplier(req.user.supplierId);
    successResponse(res, "Coach profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await coachService.getCoachProfile(
      req.params.coachProfileId
    );
    successResponse(res, "Coach profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await coachService.updateCoachProfile(
      req.params.coachProfileId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await coachService.deleteCoachProfile(req.params.coachProfileId);
    successResponse(res, "Profile deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNearbyCoaches = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const coaches = await coachService.getNearbyCoaches(
      latitude,
      longitude,
      radius
    );
    successResponse(res, "Nearby coaches fetched", coaches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const addCertification = async (req, res) => {
  try {
    const updated = await coachService.addCoachCertification(
      req.params.coachProfileId,
      req.body
    );
    successResponse(res, "Certification added", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAllCoaches = async (req, res) => {
  try {
    const {
      city,
      sport,
      rating,
      ageGroup,
      classType,
      minPrice,
      maxPrice,
      experience,
      page = 1,
      limit = 20,
      latitude,
      longitude,
      radius,
      sortBy = "priority",
    } = req.query;

    const filters = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sortBy,
    };

    // Add filters if they exist
    if (city) filters.city = city;
    if (sport) filters.sport = sport;
    if (rating) filters.minRating = Number.parseFloat(rating);
    if (ageGroup) filters.ageGroup = ageGroup;
    if (classType) filters.classType = classType;
    if (minPrice) filters.minPrice = Number.parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = Number.parseFloat(maxPrice);
    if (experience) filters.minExperience = Number.parseInt(experience);
    if (latitude && longitude) {
      filters.latitude = Number.parseFloat(latitude);
      filters.longitude = Number.parseFloat(longitude);
      filters.radius = radius ? Number.parseFloat(radius) : 5000; // Default 5km
    }

    const coaches = await coachService.searchCoaches(filters);
    successResponse(res, "Coaches fetched successfully", coaches);
  } catch (error) {
    errorResponse(res, error.message || "Failed to fetch coaches", error);
  }
};

// Batch controllers
const createBatch = async (req, res) => {
  try {
    const batch = await coachService.createBatch(
      req.params.coachProfileId,
      req.body
    );
    successResponse(res, "Batch created successfully", batch);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatch = async (req, res) => {
  try {
    const batch = await coachService.getBatchById(req.params.batchId);
    successResponse(res, "Batch fetched successfully", batch);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachBatches = async (req, res) => {
  try {
    const batches = await coachService.getCoachBatches(
      req.params.coachProfileId
    );
    successResponse(res, "Batches fetched successfully", batches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateBatch = async (req, res) => {
  try {
    const batch = await coachService.updateBatch(req.params.batchId, req.body);
    successResponse(res, "Batch updated successfully", batch);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteBatch = async (req, res) => {
  try {
    await coachService.deleteBatch(req.params.batchId);
    successResponse(res, "Batch deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Batch student controllers
const getBatchStudents = async (req, res) => {
  try {
    const students = await coachService.getBatchStudents(req.params.batchId);
    successResponse(res, "Batch students fetched successfully", students);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const addStudentToBatch = async (req, res) => {
  try {
    // Now we pass the entire req.body instead of just req.body.userId
    const student = await coachService.addStudentToBatch(
      req.params.batchId,
      req.body
    );
    successResponse(res, "Student added to batch successfully", student);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const removeStudentFromBatch = async (req, res) => {
  try {
    await coachService.removeStudentFromBatch(
      req.params.batchId,
      req.params.userId
    );
    successResponse(res, "Student removed from batch successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Batch payment controllers
const createBatchPayment = async (req, res) => {
  try {
    const payment = await coachService.createBatchPayment(
      req.params.batchId,
      req.body.userId,
      req.body
    );
    successResponse(res, "Payment created successfully", payment);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchPayments = async (req, res) => {
  try {
    const payments = await coachService.getBatchPayments(req.params.batchId);
    successResponse(res, "Batch payments fetched successfully", payments);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const searchCoaches = async (req, res) => {
  try {
    const filters = req.query;
    const result = await coachService.searchCoaches(filters);
    return successResponse(res, "Coaches fetched successfully", result);
  } catch (error) {
    console.error("Error in searchCoaches:", error);
    return errorResponse(res, error.message);
  }
};

// New endpoint to fetch student achievements or feedback
const getStudentData = async (req, res) => {
  try {
    const { type, coachId, studentId } = req.query;

    if (!type || (type !== "achievements" && type !== "feedback")) {
      return errorResponse(
        res,
        "Invalid data type. Must be 'achievements' or 'feedback'",
        null,
        400
      );
    }

    let data;
    if (type === "achievements") {
      data = await coachService.getStudentAchievements(coachId, studentId);
    } else {
      data = await coachService.getStudentFeedback(coachId, studentId);
    }

    successResponse(res, `Student ${type} fetched successfully`, data);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// New endpoint to fetch coaches by user
const getCoachesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return errorResponse(res, "User ID is required", null, 400);
    }

    const coaches = await coachService.getCoachesByUser(userId);
    successResponse(res, "User's coaches fetched successfully", coaches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get monthly metrics
const getMonthlyAnalytics = async (req, res) => {
  try {
    const metrics = await coachService.getMonthlyAnalytics(
      req.params.coachId,
      req.query
    );
    successResponse(res, "Monthly analytics fetched", metrics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};
// Get batch monthly metrics
const getBatchMonthlyAnalytics = async (req, res) => {
  try {
    const metrics = await coachService.getBatchMonthlyAnalytics(
      req.params.batchId,
      req.query
    );
    successResponse(res, "Batch monthly analytics fetched", metrics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get detailed monthly analytics
const getDetailedMonthlyAnalytics = async (req, res) => {
  try {
    const analytics = await coachService.getDetailedMonthlyAnalytics(
      req.params.coachId,
      req.params.monthId
    );
    successResponse(res, "Detailed monthly analytics fetched", analytics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get detailed batch analytics
const getDetailedBatchAnalytics = async (req, res) => {
  try {
    const analytics = await coachService.getDetailedBatchAnalytics(
      req.params.batchId,
      req.params.monthId
    );
    successResponse(res, "Detailed batch analytics fetched", analytics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Refresh analytics
const refreshAnalytics = async (req, res) => {
  try {
    const result = await coachService.refreshAnalytics(
      req.params.coachId,
      req.params.monthId
    );
    successResponse(res, "Analytics refreshed", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfileWithPromotion = async (req, res) => {
  try {
    const profile = await coachService.getCoachWithPromotionStatus(
      req.params.coachProfileId
    );
    successResponse(
      res,
      "Coach profile with promotion status fetched",
      profile
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Score tracking methods
const updateStudentScore = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const scoreData = req.body;

    const updatedStudent = await coachService.updateStudentScore(
      coachId,
      studentId,
      scoreData
    );
    successResponse(res, "Student score updated successfully", updatedStudent);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentScoreHistory = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const { months = 6 } = req.query;

    const scoreHistory = await coachService.getStudentScoreHistory(
      coachId,
      studentId,
      months
    );
    successResponse(
      res,
      "Student score history fetched successfully",
      scoreHistory
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchScoreAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;

    const analytics = await coachService.getBatchScoreAnalytics(batchId);
    successResponse(
      res,
      "Batch score analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachEffectivenessReport = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { timeframe = "quarter" } = req.query;

    const report = await coachService.getCoachEffectivenessReportNew(
      coachId,
      timeframe
    );
    successResponse(
      res,
      "Coach effectiveness report generated successfully",
      report
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentsWithScores = async (req, res) => {
  try {
    const { coachId } = req.params;
    const filters = req.query;

    const students = await coachService.getStudentsWithScores(coachId, filters);
    successResponse(res, "Students with scores fetched successfully", students);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const bulkUpdateStudentScores = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { studentsScoreData } = req.body;

    const result = await coachService.bulkUpdateStudentScores(
      coachId,
      studentsScoreData
    );
    successResponse(res, "Bulk score update completed", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Quarterly progress tracking methods
const updateStudentQuarterlyProgress = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const { year, quarter } = req.params;
    const progressData = req.body;

    const updatedProgress = await coachService.updateStudentQuarterlyProgress(
      coachId,
      studentId,
      year,
      quarter,
      progressData
    );

    successResponse(
      res,
      "Student quarterly progress updated successfully",
      updatedProgress
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentQuarterlyProgress = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const { year, quarter } = req.query;

    const progress = await coachService.getStudentQuarterlyProgress(
      coachId,
      studentId,
      year,
      quarter
    );

    successResponse(
      res,
      "Student quarterly progress fetched successfully",
      progress
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateStudentCoachingPlan = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const planData = req.body;

    const updatedPlan = await coachService.updateStudentCoachingPlan(
      coachId,
      studentId,
      planData
    );
    successResponse(
      res,
      "Student coaching plan updated successfully",
      updatedPlan
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateStudentPerformanceMetrics = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const metricsData = req.body;

    const updatedMetrics = await coachService.updateStudentPerformanceMetrics(
      coachId,
      studentId,
      metricsData
    );

    successResponse(
      res,
      "Student performance metrics updated successfully",
      updatedMetrics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachProgressAnalytics = async (req, res) => {
  try {
    const { coachId } = req.params;
    const filters = req.query;

    const analytics = await coachService.getCoachProgressAnalytics(
      coachId,
      filters
    );
    successResponse(
      res,
      "Coach progress analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const generateStudentProgressReport = async (req, res) => {
  try {
    const { coachId, studentId } = req.params;
    const { year, quarter } = req.params;

    const report = await coachService.generateStudentProgressReport(
      coachId,
      studentId,
      year,
      quarter
    );
    successResponse(
      res,
      "Student progress report generated successfully",
      report
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchProgressSummary = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { year, quarter } = req.params;

    const summary = await coachService.getBatchProgressSummary(
      batchId,
      year,
      quarter
    );
    successResponse(
      res,
      "Batch progress summary fetched successfully",
      summary
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  getMyProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyCoaches,
  addCertification,
  getAllCoaches,

  getProfileWithPromotion,

  // Add the new batch controller functions
  createBatch,
  getBatch,
  getCoachBatches,
  updateBatch,
  deleteBatch,

  // Add the new batch student controller functions
  getBatchStudents,
  addStudentToBatch,
  removeStudentFromBatch,

  // Add the new batch payment controller functions
  createBatchPayment,
  getBatchPayments,
  searchCoaches,

  // New endpoints
  getStudentData,
  getCoachesByUser,
  // Analytics controller methods
  getMonthlyAnalytics,
  getBatchMonthlyAnalytics,
  getDetailedMonthlyAnalytics,
  getDetailedBatchAnalytics,
  refreshAnalytics,

  // Add score tracking exports
  updateStudentScore,
  getStudentScoreHistory,
  getBatchScoreAnalytics,
  getCoachEffectivenessReport,
  getStudentsWithScores,
  bulkUpdateStudentScores,

  // Add progress tracking exports
  updateStudentQuarterlyProgress,
  getStudentQuarterlyProgress,
  updateStudentCoachingPlan,
  updateStudentPerformanceMetrics,
  getCoachProgressAnalytics,
  generateStudentProgressReport,
  getBatchProgressSummary,
};
