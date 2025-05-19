const AcademyService = require("../../services/academy");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { userService } = require("../../services/user"); // Import userService

const createProfile = async (req, res) => {
  try {
    const profile = await AcademyService.createAcademyProfile(
      req.user.supplierId,
      req.body
    );
    successResponse(res, "Academy profile created", profile, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getMyProfiles = async (req, res) => {
  try {
    const profiles = await AcademyService.getAcademiesBySupplier(
      req.user.supplierId
    );
    successResponse(res, "Academy profiles fetched", profiles);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await AcademyService.getAcademyProfile(
      req.params.academyProfileId,
      req.body.options
    );
    successResponse(res, "Academy profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await AcademyService.updateAcademyProfile(
      req.params.academyProfileId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await AcademyService.deleteAcademyProfile(req.params.academyProfileId);
    successResponse(res, "Profile deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNearbyAcademies = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const academies = await AcademyService.getNearbyAcademies(
      latitude,
      longitude,
      radius
    );
    successResponse(res, "Nearby academies fetched", academies);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// This function is now removed, and we'll use searchAcademies directly
// const getAllAcademies = async (req, res) => {
//   try {
//     await searchAcademies(req, res)
//   } catch (error) {
//     errorResponse(res, error.message || "Failed to fetch academies", error, error.statusCode || 500)
//   }
// }

// Student-related controllers
const getAcademyStudents = async (req, res) => {
  try {
    const students = await AcademyService.getStudentsByAcademy(
      req.params.academyId,
      req.query
    );
    successResponse(res, "Academy students fetched", students);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await AcademyService.getStudentById(req.params.studentId);
    successResponse(res, "Student details fetched", student);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const createStudent = async (req, res) => {
  try {
    const student = await AcademyService.createStudent(req.body);
    successResponse(res, "Student created successfully", student, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateStudent = async (req, res) => {
  try {
    const updated = await AcademyService.updateStudent(
      req.params.studentId,
      req.body
    );
    successResponse(res, "Student updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteStudent = async (req, res) => {
  try {
    await AcademyService.deleteStudent(req.params.studentId);
    successResponse(res, "Student deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Batch-related controllers
const createBatch = async (req, res) => {
  try {
    const batch = await AcademyService.createBatch(req.body);
    successResponse(res, "Batch created successfully", batch, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatch = async (req, res) => {
  try {
    const batch = await AcademyService.getBatchById(req.params.batchId);
    successResponse(res, "Batch details fetched", batch);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyBatches = async (req, res) => {
  try {
    const batches = await AcademyService.getBatchesByAcademy(
      req.params.academyId,
      req.query
    );
    successResponse(res, "Academy batches fetched", batches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateBatch = async (req, res) => {
  try {
    const updated = await AcademyService.updateBatch(
      req.params.batchId,
      req.body
    );
    successResponse(res, "Batch updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteBatch = async (req, res) => {
  try {
    await AcademyService.deleteBatch(req.params.batchId);
    successResponse(res, "Batch deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchStudents = async (req, res) => {
  try {
    const students = await AcademyService.getBatchStudents(req.params.batchId);
    successResponse(res, "Batch students fetched", students);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const enrollStudentInBatch = async (req, res) => {
  try {
    const student = await AcademyService.enrollStudentInBatch(
      req.params.batchId,
      req.body
    );
    successResponse(res, "Student enrolled successfully", student, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const unEnrollStudentFromBatch = async (req, res) => {
  try {
    const student = await AcademyService.unEnrollStudentFromBatch(
      req.params.batchId,
      req.params.studentId
    );
    successResponse(res, "Student unenrolled successfully", student);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAvailableBatches = async (req, res) => {
  try {
    console.log("Query Params:", req.query);
    const batches = await AcademyService.getAvailableBatches(req.query);
    successResponse(res, "Available batches fetched", batches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Program-related controllers
const createProgram = async (req, res) => {
  try {
    const program = await AcademyService.createProgram(req.body);
    successResponse(res, "Program created successfully", program, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProgram = async (req, res) => {
  try {
    const program = await AcademyService.getProgramById(req.params.programId);
    successResponse(res, "Program details fetched", program);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyPrograms = async (req, res) => {
  try {
    const programs = await AcademyService.getProgramsByAcademy(
      req.params.academyId
    );
    successResponse(res, "Academy programs fetched", programs);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProgram = async (req, res) => {
  try {
    const updated = await AcademyService.updateProgram(
      req.params.programId,
      req.body
    );
    successResponse(res, "Program updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProgram = async (req, res) => {
  try {
    await AcademyService.deleteProgram(req.params.programId);
    successResponse(res, "Program deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProgramStudents = async (req, res) => {
  try {
    const students = await AcademyService.getEnrolledStudents(
      req.params.programId
    );
    successResponse(res, "Program students fetched", students);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const enrollStudentInProgram = async (req, res) => {
  try {
    const student = await AcademyService.enrollStudentInProgram(
      req.params.programId,
      req.body
    );
    successResponse(res, "Student enrolled successfully", student, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const unEnrollStudentFromProgram = async (req, res) => {
  try {
    const student = await AcademyService.unEnrollStudentFromProgram(
      req.params.programId,
      req.params.studentId
    );
    successResponse(res, "Student unenrolled successfully", student);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Fee-related controllers
const createFee = async (req, res) => {
  try {
    const fee = await AcademyService.createFee(req.body);
    successResponse(res, "Fee created successfully", fee, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getFee = async (req, res) => {
  try {
    const fee = await AcademyService.getFeeById(req.params.feeId);
    successResponse(res, "Fee details fetched", fee);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentFees = async (req, res) => {
  try {
    const fees = await AcademyService.getFeesByStudent(req.params.studentId);
    successResponse(res, "Student fees fetched", fees);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyFees = async (req, res) => {
  try {
    const fees = await AcademyService.getFeesByAcademy(
      req.params.academyId,
      req.query
    );
    successResponse(res, "Academy fees fetched", fees);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateFee = async (req, res) => {
  try {
    const updated = await AcademyService.updateFee(req.params.feeId, req.body);
    successResponse(res, "Fee updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteFee = async (req, res) => {
  try {
    await AcademyService.deleteFee(req.params.feeId);
    successResponse(res, "Fee deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const recordPayment = async (req, res) => {
  try {
    const updated = await AcademyService.recordFeePayment(
      req.params.feeId,
      req.body
    );
    successResponse(res, "Payment recorded", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getOverdueFees = async (req, res) => {
  try {
    const fees = await AcademyService.getOverdueFees();
    successResponse(res, "Overdue fees fetched", fees);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const searchAcademies = async (req, res) => {
  try {
    console.log("Raw query params:", req.query);

    const {
      city,
      sport,
      rating,
      ageGroup,
      classType,
      // Removed minPrice and maxPrice as they don't exist in the model
      facilities,
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
    // Removed minPrice and maxPrice filters
    if (facilities) filters.facilities = facilities.split(",");
    if (latitude && longitude) {
      filters.latitude = Number.parseFloat(latitude);
      filters.longitude = Number.parseFloat(longitude);
      filters.radius = radius ? Number.parseFloat(radius) : 5000; // Default 5km
    }

    // If user is logged in, we can potentially get their location
    if (req.user && (!latitude || !longitude)) {
      // Assuming there's a userService or similar way to get user data
      const user = await userService.getUserById(req.user.userId);
      if (user) {
        filters.latitude = user.latitude;
        filters.longitude = user.longitude;
      }
    }

    console.log("Processed filters:", filters);
    const result = await AcademyService.searchAcademies(filters);
    return successResponse(res, "Academies fetched successfully", result);
  } catch (error) {
    console.error("Error in searchAcademies controller:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch academies",
      error,
      error.statusCode || 500
    );
  }
};

// New endpoint to fetch student achievements or feedback
const getStudentData = async (req, res) => {
  try {
    const { type, academyId, studentId } = req.query;

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
      data = await AcademyService.getStudentAchievements(academyId, studentId);
    } else {
      data = await AcademyService.getStudentFeedback(academyId, studentId);
    }

    successResponse(res, `Student ${type} fetched successfully`, data);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// New endpoint to fetch academies by user
const getAcademiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return errorResponse(res, "User ID is required", null, 400);
    }

    const academies = await AcademyService.getAcademiesByUser(userId);
    successResponse(res, "User's academies fetched successfully", academies);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  createProfile,
  getMyProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyAcademies,
  // Removed getAllAcademies
  // Student-related exports
  getAcademyStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  // Batch-related exports
  createBatch,
  getBatch,
  getAcademyBatches,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  enrollStudentInBatch,
  unEnrollStudentFromBatch,
  getAvailableBatches,
  // Program-related exports
  createProgram,
  getProgram,
  getAcademyPrograms,
  updateProgram,
  deleteProgram,
  getProgramStudents,
  enrollStudentInProgram,
  unEnrollStudentFromProgram,
  // Fee-related exports
  createFee,
  getFee,
  getStudentFees,
  getAcademyFees,
  updateFee,
  deleteFee,
  recordPayment,
  getOverdueFees,
  searchAcademies,
  // New endpoints
  getStudentData,
  getAcademiesByUser,
};
