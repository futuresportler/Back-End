const { v4: uuidv4 } = require("uuid");
const { sequelize, CoachStudent, CoachProfile } = require("../../database");
const coachRepository = require("./repositories/coachRepository");
const { SupplierService } = require("../supplier/index");
// Add this import at the top of the file
const coachSearchRepository = require("./repositories/coachSearchRepository");
const coachAnalyticsRepository = require("./repositories/coachAnalyticsRepository");
const scoreService = require("../score/scoreService");

const getCoachProfile = async (coachProfileId) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId);
  if (!profile) {
    throw new Error("Coach profile not found");
  }
  return profile;
};

const getCoachBySupplier = async (supplierId) => {
  const profile = await coachRepository.findCoachBySupplierId(supplierId);
  if (!profile) {
    throw new Error("No coach profile found for this supplier");
  }
  return profile;
};

const updateCoachProfile = async (coachProfileId, updateData) => {
  const updated = await coachRepository.updateCoachProfile(
    coachProfileId,
    updateData
  );
  if (!updated) {
    throw new Error("Coach profile not found");
  }
  return updated;
};

const deleteCoachProfile = async (coachProfileId) => {
  const deleted = await coachRepository.deleteCoachProfile(coachProfileId);
  if (!deleted) {
    throw new Error("Coach profile not found");
  }

  // Reset supplier module if needed
  await SupplierService.updateSupplierModule(
    deleted.supplierId,
    "coach",
    false
  );
  return deleted;
};

const getNearbyCoaches = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) {
    throw new Error("Coordinates are required");
  }
  return await coachRepository.findCoachesNearby(latitude, longitude, radius);
};

const addCoachCertification = async (coachProfileId, certificationData) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId);
  if (!profile) {
    throw new Error("Coach profile not found");
  }

  // Add certification to the certifications array
  const updatedCertifications = [
    ...(profile.certifications || []),
    certificationData,
  ];

  return await coachRepository.updateCoachProfile(coachProfileId, {
    certifications: updatedCertifications,
  });
};

// Student management
const addStudent = async (coachId, userId, studentData) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  // Check if student already exists
  const existingStudent = await coachRepository.findCoachStudent(
    coachId,
    userId
  );
  if (existingStudent) {
    throw new Error("Student already added to this coach");
  }

  // Add student
  const student = await coachRepository.createCoachStudent({
    coachId,
    userId,
    ...studentData,
  });

  // Update coach total students count
  await coachRepository.updateCoachProfile(coachId, {
    totalStudents: sequelize.literal("totalStudents + 1"),
  });

  return student;
};

const getCoachStudents = async (coachId) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  return await coachRepository.findCoachStudents(coachId);
};

const updateStudentProgress = async (coachId, userId, progressData) => {
  const student = await coachRepository.findCoachStudent(coachId, userId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return await coachRepository.updateCoachStudent(student.id, progressData);
};

// Monthly metrics and summaries
const getMonthlyMetrics = async (coachId, monthId) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  let metrics = await coachRepository.findMonthlyCoachMetric(coachId, monthId);
  if (!metrics) {
    // Create empty metrics if none exist
    metrics = await coachRepository.createMonthlyCoachMetric({
      coachId,
      monthId,
    });
  }

  return metrics;
};

const updateMonthlyMetrics = async (coachId, monthId, metricsData) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  let metrics = await coachRepository.findMonthlyCoachMetric(coachId, monthId);
  if (!metrics) {
    metrics = await coachRepository.createMonthlyCoachMetric({
      coachId,
      monthId,
      ...metricsData,
    });
  } else {
    metrics = await coachRepository.updateMonthlyCoachMetric(
      metrics.metricId,
      metricsData
    );
  }

  return metrics;
};

const getStudentMonthlyProgress = async (coachId, userId, monthId) => {
  const student = await coachRepository.findCoachStudent(coachId, userId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  let progress = await coachRepository.findMonthlyStudentProgress(
    coachId,
    userId,
    monthId
  );
  if (!progress) {
    // Create empty progress if none exists
    progress = await coachRepository.createMonthlyStudentProgress({
      coachId,
      userId,
      monthId,
    });
  }

  return progress;
};

const updateStudentMonthlyProgress = async (
  coachId,
  userId,
  monthId,
  progressData
) => {
  const student = await coachRepository.findCoachStudent(coachId, userId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  let progress = await coachRepository.findMonthlyStudentProgress(
    coachId,
    userId,
    monthId
  );
  if (!progress) {
    progress = await coachRepository.createMonthlyStudentProgress({
      coachId,
      userId,
      monthId,
      ...progressData,
    });
  } else {
    progress = await coachRepository.updateMonthlyStudentProgress(
      progress.progressId,
      progressData
    );
  }

  return progress;
};

// Batch management
const createBatch = async (coachId, batchData) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  // Validate batch data
  if (batchData.startTime >= batchData.endTime) {
    throw new Error("End time must be after start time");
  }

  // Create the batch
  return await coachRepository.createCoachBatch({
    ...batchData,
    coachId,
  });
};

const getBatchById = async (batchId) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }
  return batch;
};

const getCoachBatches = async (coachId) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  return await coachRepository.findCoachBatches(coachId);
};

const updateBatch = async (batchId, updateData) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  if (
    updateData.startTime &&
    updateData.endTime &&
    updateData.startTime >= updateData.endTime
  ) {
    throw new Error("End time must be after start time");
  }

  return await coachRepository.updateCoachBatch(batchId, updateData);
};

const deleteBatch = async (batchId) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  return await coachRepository.deleteCoachBatch(batchId);
};

// Batch student management
const getBatchStudents = async (batchId) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  return await coachRepository.findStudentsByBatch(batchId);
};

// Updated to handle students without userId
const addStudentToBatch = async (batchId, studentData) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  // Check if batch has space
  if (batch.currentStudents >= batch.maxStudents) {
    throw new Error("Batch is full");
  }

  let student;

  // If we have a userId, check if student already exists
  if (studentData.userId) {
    student = await coachRepository.findCoachStudent(
      batch.coachId,
      studentData.userId
    );
  }

  if (student) {
    // Update existing student record
    student = await coachRepository.updateCoachStudent(student.id, {
      batchId,
      ...studentData,
    });
  } else {
    // Create new student record
    student = await coachRepository.createCoachStudent({
      coachId: batch.coachId,
      batchId,
      ...studentData,
    });
  }

  // Update batch current students count
  await batch.update({
    currentStudents: sequelize.literal("currentStudents + 1"),
  });

  return student;
};

const removeStudentFromBatch = async (batchId, userId) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  return await coachRepository.removeStudentFromBatch(batchId, userId);
};

// Batch payment management
const createBatchPayment = async (batchId, userId, paymentData) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  // Check if student is in the batch
  const student = await coachRepository.findStudentsByBatch(batchId);
  const isStudentInBatch = student.some((s) => s.userId === userId);

  if (!isStudentInBatch) {
    throw new Error("Student is not enrolled in this batch");
  }

  return await coachRepository.createBatchPayment({
    ...paymentData,
    batchId,
    userId,
    coachId: batch.coachId,
    paymentType: batch.feeType === "monthly" ? "monthly" : "session",
  });
};

const getBatchPayments = async (batchId) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  return await coachRepository.findBatchPayments(batchId);
};

// Add this function to the coachService.js file
const searchCoaches = async (filters) => {
  return await coachSearchRepository.searchCoaches(filters);
};

// Add these new methods to the coachService.js file
const getStudentAchievements = async (coachId, studentId) => {
  const query = {};

  if (coachId) {
    query.coachId = coachId;
  }

  if (studentId) {
    query.id = studentId; // Note: using 'id' instead of 'studentId' since that's the primary key in CoachStudent
  }

  const students = await CoachStudent.findAll({
    where: query,
    attributes: ["id", "name", "coachId", "achievements"],
    raw: true,
  });

  return students.map((student) => ({
    studentId: student.id,
    name: student.name,
    coachId: student.coachId,
    achievements: student.achievements || [],
  }));
};

const getStudentFeedback = async (coachId, studentId) => {
  const query = {};

  if (coachId) {
    query.coachId = coachId;
  }

  if (studentId) {
    query.id = studentId;
  }

  const students = await CoachStudent.findAll({
    where: query,
    attributes: ["id", "name", "coachId", "coachFeedback"],
    raw: true,
  });

  return students.map((student) => ({
    studentId: student.id,
    name: student.name,
    coachId: student.coachId,
    feedback: student.coachFeedback || [],
  }));
};

const getCoachesByUser = async (userId) => {
  // Find all coaches where this user is enrolled as a student
  const enrollments = await CoachStudent.findAll({
    where: { userId },
    include: [
      {
        model: CoachProfile,
        as: "coach",
        attributes: ["coachId", "name", "sport", "experience"],
      },
    ],
  });

  // Extract and return the coach information
  return enrollments.map((enrollment) => enrollment.coach);
};

// Get monthly analytics for a coach
const getMonthlyAnalytics = async (coachId, filters = {}) => {
  return await coachAnalyticsRepository.getMonthlyMetrics(coachId, filters);
};

// Get monthly analytics for a specific batch
const getBatchMonthlyAnalytics = async (batchId, filters = {}) => {
  return await coachAnalyticsRepository.getBatchMonthlyMetrics(
    batchId,
    filters
  );
};

// Get detailed analytics for a specific month
const getDetailedMonthlyAnalytics = async (coachId, monthId) => {
  const metrics = await coachAnalyticsRepository.getOrCreateMonthlyMetric(
    coachId,
    monthId
  );

  // Get the batch breakdown from the metrics
  const batchBreakdown = metrics.batchMetrics || {};

  // Format the response
  return {
    overview: {
      totalSessions: metrics.totalSessions,
      completedSessions: metrics.completedSessions,
      cancelledSessions: metrics.cancelledSessions,
      totalRevenue: metrics.totalRevenue,
      averageRating: metrics.averageRating,
      totalReviews: metrics.totalReviews,
      activeStudents: metrics.activeStudents,
      newStudents: metrics.newStudents,
      utilization: metrics.utilization,
    },
    growth: {
      growthRate: metrics.growthRate,
      retentionRate: metrics.retentionRate,
    },
    distribution: {
      hourlySessionDistribution: metrics.hourlySessionDistribution,
      dailyRevenue: metrics.dailyRevenue,
    },
    batches: batchBreakdown,
  };
};
const getDetailedBatchAnalytics = async (batchId, monthId) => {
  const metrics = await coachAnalyticsRepository.getOrCreateBatchMonthlyMetric(
    batchId,
    monthId
  );

  // Format the response
  return {
    overview: {
      totalSessions: metrics.totalSessions,
      completedSessions: metrics.completedSessions,
      cancelledSessions: metrics.cancelledSessions,
      totalRevenue: metrics.totalRevenue,
      averageRating: metrics.averageRating,
      totalReviews: metrics.totalReviews,
      activeStudents: metrics.activeStudents,
      newStudents: metrics.newStudents,
      utilization: metrics.utilization,
    },
    distribution: {
      dailyRevenue: metrics.dailyRevenue,
    },
    performance: {
      attendanceRate: metrics.attendanceRate,
    },
  };
};

// Refresh analytics for a coach (could be triggered manually)
const refreshAnalytics = async (coachId, monthId) => {
  return await coachAnalyticsRepository.updateAllCoachMetrics(coachId, monthId);
};

const getCoachWithFeedback = async (coachId) => {
  try {
    const coach = await coachRepository.getCoachById(coachId);
    const [feedback, analytics] = await Promise.all([
      feedbackService.getRecentFeedback("coach", coachId, 5),
      feedbackService.getFeedbackAnalytics("coach", coachId),
    ]);

    return {
      ...coach,
      recentFeedback: feedback,
      feedbackAnalytics: analytics,
    };
  } catch (error) {
    throw new Error(`Failed to get coach with feedback: ${error.message}`);
  }
};
const getCoachWithPromotionStatus = async (coachProfileId) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId);
  if (!profile) {
    throw new Error("Coach profile not found");
  }

  return {
    ...profile.toJSON(),
    promotionStatus: {
      isPromoted: profile.priority?.value > 0,
      plan: profile.priority?.plan || "none",
      expiresAt: profile.priority?.expiresAt,
    },
  };
};
// Add the new function to the module.exports
module.exports = {
  getCoachProfile,
  getCoachBySupplier,
  updateCoachProfile,
  deleteCoachProfile,
  getNearbyCoaches,
  addCoachCertification,
  searchCoaches, // Add this line
  getCoachWithFeedback,

  // Student management
  addStudent,
  getCoachStudents,
  updateStudentProgress,

  // Monthly metrics and summaries
  getMonthlyMetrics,
  updateMonthlyMetrics,
  getStudentMonthlyProgress,
  updateStudentMonthlyProgress,

  // Add the new batch functions
  createBatch,
  getBatchById,
  getCoachBatches,
  updateBatch,
  deleteBatch,

  // Add the new batch student functions
  getBatchStudents,
  addStudentToBatch,
  removeStudentFromBatch,

  getCoachWithPromotionStatus,

  // Add the new batch payment functions
  createBatchPayment,
  getBatchPayments,
  getStudentAchievements,
  getStudentFeedback,
  getCoachesByUser,

  // Analytics methods
  getMonthlyAnalytics,
  getBatchMonthlyAnalytics,
  getDetailedMonthlyAnalytics,
  getDetailedBatchAnalytics,
  refreshAnalytics,

  // Score methods
  updateStudentScore,
  getStudentScoreHistory,
  getBatchScoreAnalytics,
  getCoachEffectivenessReport,
  getStudentsWithScores,
  bulkUpdateStudentScores,
};
