const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../../config/database");
const coachRepository = require("./repositories/coachRepository");
const { SupplierService } = require("../supplier/index");
// Add this import at the top of the file
const coachSearchRepository = require("./repositories/coachSearchRepository");

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

const addStudentToBatch = async (batchId, userId, studentData = {}) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  return await coachRepository.addStudentToBatch(
    batchId,
    userId,
    batch.coachId,
    studentData
  );
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

// Add the new function to the module.exports
module.exports = {
  getCoachProfile,
  getCoachBySupplier,
  updateCoachProfile,
  deleteCoachProfile,
  getNearbyCoaches,
  addCoachCertification,
  searchCoaches, // Add this line

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

  // Add the new batch payment functions
  createBatchPayment,
  getBatchPayments,
};
