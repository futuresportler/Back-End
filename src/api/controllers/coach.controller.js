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
    const student = await coachService.addStudentToBatch(
      req.params.batchId,
      req.body.userId,
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

module.exports = {
  getMyProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyCoaches,
  addCertification,
  getAllCoaches,

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
};
