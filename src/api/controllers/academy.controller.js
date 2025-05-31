const AcademyService = require("../../services/academy");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { userService } = require("../../services/user"); // Import userService
const fs = require("fs").promises;
const path = require("path");
const profileFactory = require("../../services/supplier/profileFactory");
const supplierRepository = require("../../services/supplier/repositories/supplierRepository");

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
    // Automatically record the profile view
    try {
      // Only record view if this is a client-facing request (not internal API calls)
      // You can add additional conditions as needed
      if (!req.headers["x-internal-api"]) {
        await AcademyService.recordProfileView(req.params.academyProfileId, {
          userId: req.user?.userId,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          referrer: req.headers.referer,
          deviceType:
            req.headers["sec-ch-ua-mobile"] === "?0" ? "desktop" : "mobile",
        });
      }
    } catch (viewError) {
      // Log the error but don't fail the request
      console.error("Error recording profile view:", viewError);
    }
    successResponse(res, "Academy profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
    errorResponse(res, error.message, error);
  }
};

const checkAcademyPermission = async (req, res, next) => {
  try {
    const { academyId } = req.params;
    const academy = await AcademyService.getAcademyProfile(academyId);

    if (!academy) {
      return errorResponse(res, "Academy not found", null, 404);
    }

    // Check if user is owner or accepted manager
    if (academy.supplierId === req.user.supplierId) {
      req.academyRole = "owner";
      req.academy = academy;
      next();
    } else if (
      academy.managerId === req.user.supplierId &&
      academy.managerInvitationStatus === "accepted"
    ) {
      req.academyRole = "manager";
      req.academy = academy;
      next();
    } else {
      return errorResponse(
        res,
        "Unauthorized to access this academy",
        null,
        403
      );
    }
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
    const student = await AcademyService.createStudent(
      req.body,
      req.user.supplierId
    );
    successResponse(res, "Student created successfully", student, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateStudent = async (req, res) => {
  try {
    const updated = await AcademyService.updateStudent(
      req.params.studentId,
      req.body,
      req.user.supplierId
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
    const batch = await AcademyService.createBatch(
      req.body,
      req.user.supplierId
    );
    successResponse(res, "Batch created successfully", batch, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
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

// Record profile view
const recordProfileView = async (req, res) => {
  try {
    const view = await AcademyService.recordProfileView(req.body.academyId, {
      userId: req.user?.userId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      referrer: req.headers.referer,
      deviceType: req.body.deviceType,
    });
    successResponse(res, "Profile view recorded", view, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Create inquiry
const createInquiry = async (req, res) => {
  try {
    const inquiry = await AcademyService.createInquiry(req.body);
    successResponse(res, "Inquiry created successfully", inquiry, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get inquiries
const getInquiries = async (req, res) => {
  try {
    const inquiries = await AcademyService.getInquiries(
      req.params.academyId,
      req.query
    );
    successResponse(res, "Inquiries fetched successfully", inquiries);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get monthly metrics
const getMonthlyMetrics = async (req, res) => {
  try {
    const metrics = await AcademyService.getMonthlyMetrics(
      req.params.academyId,
      req.query
    );
    successResponse(res, "Monthly metrics fetched", metrics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get program monthly metrics
const getProgramMonthlyMetrics = async (req, res) => {
  try {
    const metrics = await AcademyService.getProgramMonthlyMetrics(
      req.params.programId,
      req.params.monthId
    );
    successResponse(res, "Program monthly metrics fetched", metrics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Get conversion rate
const getConversionRate = async (req, res) => {
  try {
    const data = await AcademyService.getConversionRate(
      req.params.academyId,
      req.params.monthId
    );
    successResponse(res, "Conversion rate calculated", data);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyCoachFeedback = async (req, res) => {
  try {
    const { academyId } = req.params;

    if (!academyId) {
      return errorResponse(res, "Academy ID is required", null, 400);
    }

    const feedback = await AcademyService.getAcademyCoachFeedback(academyId);
    successResponse(res, "Academy coach feedback fetched successfully", {
      feedback,
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBookingPlatforms = async (req, res) => {
  try {
    const { academyId } = req.params;
    const period = req.query.period ? Number.parseInt(req.query.period) : 3;

    if (!academyId) {
      return errorResponse(res, "Academy ID is required", null, 400);
    }

    if (isNaN(period) || period < 1 || period > 12) {
      return errorResponse(
        res,
        "Period must be a number between 1 and 12",
        null,
        400
      );
    }

    const bookingData = await AcademyService.getBookingPlatforms(
      academyId,
      period
    );
    successResponse(
      res,
      "Booking platforms data fetched successfully",
      bookingData
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getPopularPrograms = async (req, res) => {
  try {
    const { academyId } = req.params;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 5;

    if (!academyId) {
      return errorResponse(res, "Academy ID is required", null, 400);
    }

    if (isNaN(limit) || limit < 1 || limit > 20) {
      return errorResponse(
        res,
        "Limit must be a number between 1 and 20",
        null,
        400
      );
    }

    const popularPrograms = await AcademyService.getPopularPrograms(
      academyId,
      limit
    );
    successResponse(
      res,
      "Popular programs fetched successfully",
      popularPrograms
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Academy Coach controller methods
const createAcademyCoach = async (req, res) => {
  try {
    const { academyId } = req.params;

    // Add academy ownership validation
    const academy = await AcademyService.getAcademyProfile(academyId);
    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(
        res,
        "Unauthorized to create coaches for this academy",
        null,
        403
      );
    }

    const coach = await AcademyService.createAcademyCoach(academyId, req.body);
    successResponse(res, "Academy coach created successfully", coach, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyCoach = async (req, res) => {
  try {
    const { coachId } = req.params;
    const coach = await AcademyService.getAcademyCoach(coachId);
    successResponse(res, "Academy coach fetched successfully", coach);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyCoaches = async (req, res) => {
  try {
    const { academyId } = req.params;
    const coaches = await AcademyService.getAcademyCoaches(
      academyId,
      req.query
    );
    successResponse(res, "Academy coaches fetched successfully", coaches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateAcademyCoach = async (req, res) => {
  try {
    const { coachId } = req.params;

    // Add authorization check - coach must belong to user's academy
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to update this coach", null, 403);
    }

    const updatedCoach = await AcademyService.updateAcademyCoach(
      coachId,
      req.body
    );
    successResponse(res, "Academy coach updated successfully", updatedCoach);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteAcademyCoach = async (req, res) => {
  try {
    const { coachId } = req.params;

    // Add authorization check
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to delete this coach", null, 403);
    }

    await AcademyService.deleteAcademyCoach(coachId);
    successResponse(res, "Academy coach deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const assignCoachToBatch = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { batchId, isPrimary } = req.body;

    // Validate coach belongs to user's academy
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to assign this coach", null, 403);
    }

    // Validate batch belongs to same academy
    const batch = await AcademyService.getBatchById(batchId);
    if (batch.academyId !== coach.academyId) {
      return errorResponse(
        res,
        "Coach and batch must belong to the same academy",
        null,
        400
      );
    }

    const assignment = await AcademyService.academyCoachService.assignToBatch(
      coachId,
      batchId,
      isPrimary
    );
    successResponse(res, "Coach assigned to batch successfully", assignment);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const removeCoachFromBatch = async (req, res) => {
  try {
    const { coachId, batchId } = req.params;

    // Add authorization check
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to remove this coach", null, 403);
    }

    await AcademyService.academyCoachService.removeFromBatch(coachId, batchId);
    successResponse(res, "Coach removed from batch successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const assignCoachToProgram = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { programId, isPrimary } = req.body;

    // Validate coach belongs to user's academy
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to assign this coach", null, 403);
    }

    // Validate program belongs to same academy
    const program = await AcademyService.getProgramById(programId);
    if (program.academyId !== coach.academyId) {
      return errorResponse(
        res,
        "Coach and program must belong to the same academy",
        null,
        400
      );
    }

    const assignment = await AcademyService.academyCoachService.assignToProgram(
      coachId,
      programId,
      isPrimary
    );
    successResponse(res, "Coach assigned to program successfully", assignment);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const removeCoachFromProgram = async (req, res) => {
  try {
    const { coachId, programId } = req.params;

    // Add authorization check
    const coach = await AcademyService.getAcademyCoach(coachId);
    const academy = await AcademyService.getAcademyProfile(coach.academyId);

    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(res, "Unauthorized to remove this coach", null, 403);
    }

    await AcademyService.academyCoachService.removeFromProgram(
      coachId,
      programId
    );
    successResponse(res, "Coach removed from program successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachBatchesAndPrograms = async (req, res) => {
  try {
    const { coachId } = req.params;
    const data = await AcademyService.getCoachBatchesAndPrograms(coachId);
    successResponse(
      res,
      "Coach batches and programs fetched successfully",
      data
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getCoachSchedule = async (req, res) => {
  try {
    const { coachId } = req.params;
    const schedule = await AcademyService.getCoachSchedule(coachId);
    successResponse(res, "Coach schedule fetched successfully", schedule);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const syncCoachesWithPlatform = async (req, res) => {
  try {
    const { academyId } = req.params;

    // Add academy ownership validation
    const academy = await AcademyService.getAcademyProfile(academyId);
    if (academy.supplierId !== req.user.supplierId) {
      return errorResponse(
        res,
        "Unauthorized to sync coaches for this academy",
        null,
        403
      );
    }

    const result =
      await AcademyService.academyCoachService.syncAllCoachesWithPlatform(
        academyId
      );
    successResponse(res, "Coaches synced with platform successfully", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Invitation endpoints
const inviteCoach = async (req, res) => {
  try {
    const { academyId } = req.params;
    const invitation = await AcademyService.inviteCoachToAcademy(
      academyId,
      req.user.supplierId,
      req.body
    );
    successResponse(res, "Coach invitation sent successfully", invitation, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};
const getProfileWithPromotion = async (req, res) => {
  try {
    const profile = await AcademyService.getAcademyWithPromotionStatus(
      req.params.academyProfileId,
      req.query
    );
    successResponse(
      res,
      "Academy profile with promotion status fetched",
      profile
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};
const refreshMetrics = async (req, res) => {
  try {
    await AcademyService.refreshMetrics(
      req.params.academyId,
      req.params.monthId
    );
    successResponse(res, "Academy metrics refreshed successfully");
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Bulk import academies
const bulkImportArcheryAcademies = async (req, res) => {
  try {
    const { password, mobile_number } = req.params;

    // Simple password check (you might want to use a more secure approach)
    if (password !== "adminPass") {
      return errorResponse(res, "Unauthorized access", null, 401);
    }

    // Read the JSON file
    const jsonFilePath = path.join(
      __dirname,
      "../../../src/scripts/Archery_data.json"
    );
    const jsonData = await fs.readFile(jsonFilePath, "utf8");
    const academies = JSON.parse(jsonData);

    console.log(`Found ${academies.length} academies to import`);

    // Use the provided mobile number
    if (!mobile_number) {
      return errorResponse(
        res,
        "Admin mobile number not found in request parameters",
        null,
        500
      );
    }
    const { supplierId } = await supplierRepository.findSupplierByMobile(
      mobile_number
    );
    // Batch processing
    const batchSize = 10; // Process 10 academies at a time
    const delay = 1500; // 1.5 seconds delay between batches
    const results = {
      total: academies.length,
      processed: 0,
      successful: 0,
      failed: 0,
      failures: [],
    };

    // Process academies in batches
    for (let i = 0; i < academies.length; i += batchSize) {
      const batch = academies.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
          academies.length / batchSize
        )}`
      );

      // Process each academy in the batch
      const batchPromises = batch.map(async (academy) => {
        // Transform the data to match academyProfile schema
        const academyData = transformArcheryData(academy);
        try {
          // Create the academy profile
          const createdAcademy = await profileFactory.createProfile(
            "academy",
            supplierId,
            academyData
          );
          console.log(
            `Successfully created academy: ${academyData.basic_info.academy_name}`
          );
          results.successful++;
          return createdAcademy;
        } catch (error) {
          console.error(
            `Failed to create academy ${academyData.basic_info.academy_name}: ${error.message}`
          );
          results.failed++;
          results.failures.push({
            name: academyData.basic_info.academy_name,
            error: error.message,
          });
          return null;
        } finally {
          results.processed++;
        }
      });

      // Wait for all academies in the batch to be processed
      await Promise.all(batchPromises);

      // Add delay between batches if not the last batch
      if (i + batchSize < academies.length) {
        console.log(
          `Waiting ${delay / 1000} seconds before processing next batch...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    successResponse(res, "Bulk import completed", results);
  } catch (error) {
    console.error("Error in bulk import:", error);
    errorResponse(res, error.message, error);
  }
};

// Helper function to transform archery data to match academyProfile schema
const transformArcheryData = (archeryData) => {
  // Extract year from establishment year or use random recent year
  const foundedYear = archeryData["Establishment Year"]
    ? Number.parseInt(archeryData["Establishment Year"])
    : new Date().getFullYear() - Math.floor(Math.random() * 10);

  // Address
  const address = archeryData["Full Address"] || "Address not available";

  // Gallery Images
  const galleryImages = archeryData["Gallery Images"]
    ? archeryData["Gallery Images"]
        .split(", ")
        .filter((url) => url.startsWith("http"))
    : [];

  // Default to archery
  const sports = ["archery"];

  // State as city fallback
  const city = archeryData["STATE"] || "Unknown";

  // Description
  const name = archeryData["Name"] || "Unnamed Archery Academy";
  const description = `${name} offers professional archery training for all age groups. Located in ${city}, it provides quality coaching and facilities for archery enthusiasts.`;

  // Transform to match createAcademyProfile expected shape
  return {
    basic_info: {
      academy_name: name,
      academy_description: description,
      year_of_establishment: foundedYear,
      city,
      full_address: address,
    },
    sports_details: {
      sports_available: sports,
      facilities: [
        "Archery Range",
        "Equipment Rental",
        "Professional Coaching",
      ],
      age_groups: {
        children: true,
        teens: true,
        adults: true,
      },
      class_types: {
        "group-classes": true,
      },
      academy_photos: galleryImages,
    },
    manager_info: {
      owner_is_manager: true,
      managerId: null, // Add this line
    },
  };
};

// Add score tracking controller methods after existing methods

const updateStudentScore = async (req, res) => {
  try {
    const { academyId, studentId } = req.params;
    const scoreData = req.body;
    const assessorId = req.user.supplierId;

    const updatedStudent = await AcademyService.updateStudentScore(
      academyId,
      studentId,
      scoreData,
      assessorId
    );

    successResponse(res, "Student score updated successfully", updatedStudent);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentScoreAnalytics = async (req, res) => {
  try {
    const { academyId, studentId } = req.params;
    const { months = 6 } = req.query;

    const analytics = await AcademyService.getStudentScoreAnalytics(
      academyId,
      studentId,
      months
    );

    successResponse(
      res,
      "Student score analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchScoreAnalytics = async (req, res) => {
  try {
    const { academyId, batchId } = req.params;

    const analytics = await AcademyService.getBatchScoreAnalytics(
      academyId,
      batchId
    );
    successResponse(
      res,
      "Batch score analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProgramScoreAnalytics = async (req, res) => {
  try {
    const { academyId, programId } = req.params;

    const analytics = await AcademyService.getProgramScoreAnalytics(
      academyId,
      programId
    );
    successResponse(
      res,
      "Program score analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getStudentsWithScoreAnalytics = async (req, res) => {
  try {
    const { academyId } = req.params;
    const filters = req.query;

    const students = await AcademyService.getStudentsWithScoreAnalytics(
      academyId,
      filters
    );
    successResponse(
      res,
      "Students with score analytics fetched successfully",
      students
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const awardStudentAchievement = async (req, res) => {
  try {
    const { academyId, studentId } = req.params;
    const achievement = req.body;

    const updatedStudent = await AcademyService.awardStudentAchievement(
      academyId,
      studentId,
      achievement
    );

    successResponse(
      res,
      "Student achievement awarded successfully",
      updatedStudent
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyScoreOverview = async (req, res) => {
  try {
    const { academyId } = req.params;

    const overview = await AcademyService.getAcademyScoreOverview(academyId);
    successResponse(
      res,
      "Academy score overview fetched successfully",
      overview
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const bulkUpdateStudentScores = async (req, res) => {
  try {
    const { academyId } = req.params;
    const { studentsScoreData } = req.body;
    const assessorId = req.user.supplierId;

    const result = await AcademyService.bulkUpdateStudentScores(
      academyId,
      studentsScoreData,
      assessorId
    );

    successResponse(res, "Bulk score update completed", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Progress tracking controller methods
const updateStudentQuarterlyProgress = async (req, res) => {
  try {
    const { academyId, studentId, year, quarter } = req.params;
    const progressData = req.body;
    const updaterSupplierId = req.user.supplierId;

    const updatedProgress = await AcademyService.updateStudentQuarterlyProgress(
      academyId,
      studentId,
      year,
      quarter,
      progressData,
      updaterSupplierId
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
    const { academyId, studentId } = req.params;
    const { year, quarter } = req.query;

    const progress = await AcademyService.getStudentQuarterlyProgress(
      academyId,
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

const generateStudentQuarterlyReport = async (req, res) => {
  try {
    const { academyId, studentId, year, quarter } = req.params;
    const generatorSupplierId = req.user.supplierId;

    const report = await AcademyService.generateStudentQuarterlyReport(
      academyId,
      studentId,
      year,
      quarter,
      generatorSupplierId
    );

    successResponse(
      res,
      "Student quarterly report generated successfully",
      report
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateStudentProgressMilestones = async (req, res) => {
  try {
    const { academyId, studentId } = req.params;
    const { sport, level, achieved = true } = req.body;
    const updaterSupplierId = req.user.supplierId;

    const updatedMilestones =
      await AcademyService.updateStudentProgressMilestones(
        academyId,
        studentId,
        sport,
        level,
        achieved,
        updaterSupplierId
      );

    successResponse(
      res,
      "Student progress milestones updated successfully",
      updatedMilestones
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAcademyProgressAnalytics = async (req, res) => {
  try {
    const { academyId } = req.params;
    const filters = req.query;
    const requesterSupplierId = req.user.supplierId;

    const analytics = await AcademyService.getAcademyProgressAnalytics(
      academyId,
      filters,
      requesterSupplierId
    );

    successResponse(
      res,
      "Academy progress analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBatchProgressAnalytics = async (req, res) => {
  try {
    const { academyId, batchId } = req.params;
    const filters = req.query;

    const analytics = await AcademyService.getBatchProgressAnalytics(
      academyId,
      batchId,
      filters
    );

    successResponse(
      res,
      "Batch progress analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProgramProgressAnalytics = async (req, res) => {
  try {
    const { academyId, programId } = req.params;
    const filters = req.query;

    const analytics = await AcademyService.getProgramProgressAnalytics(
      academyId,
      programId,
      filters
    );

    successResponse(
      res,
      "Program progress analytics fetched successfully",
      analytics
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const generateBulkQuarterlyReports = async (req, res) => {
  try {
    const { academyId, year, quarter } = req.params;
    const filters = req.query;
    const generatorSupplierId = req.user.supplierId;

    const reports = await AcademyService.generateBulkQuarterlyReports(
      academyId,
      year,
      quarter,
      filters,
      generatorSupplierId
    );

    successResponse(
      res,
      "Bulk quarterly reports generated successfully",
      reports
    );
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
  getProfileWithPromotion,
  // Removed getAllAcademies
  getProfileWithPromotion,
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
  // Metrics exports
  recordProfileView,
  createInquiry,
  getInquiries,
  getMonthlyMetrics,
  getProgramMonthlyMetrics,
  getConversionRate,
  getAcademyCoachFeedback,
  getBookingPlatforms,
  getPopularPrograms,
  refreshMetrics,

  // Add Academy Coach
  createAcademyCoach,
  getAcademyCoach,
  getAcademyCoaches,
  updateAcademyCoach,
  deleteAcademyCoach,
  assignCoachToBatch,
  removeCoachFromBatch,
  assignCoachToProgram,
  removeCoachFromProgram,
  getCoachBatchesAndPrograms,
  getCoachSchedule,
  syncCoachesWithPlatform,

  checkAcademyPermission,
  inviteCoach,

  // Add the new bulk import function
  bulkImportArcheryAcademies,

  // Add score tracking exports
  updateStudentScore,
  getStudentScoreAnalytics,
  getBatchScoreAnalytics,
  getProgramScoreAnalytics,
  getStudentsWithScoreAnalytics,
  awardStudentAchievement,
  getAcademyScoreOverview,
  bulkUpdateStudentScores,

  // Add progress tracking exports
  updateStudentQuarterlyProgress,
  getStudentQuarterlyProgress,
  generateStudentQuarterlyReport,
  updateStudentProgressMilestones,
  getAcademyProgressAnalytics,
  getBatchProgressAnalytics,
  getProgramProgressAnalytics,
  generateBulkQuarterlyReports,
};
