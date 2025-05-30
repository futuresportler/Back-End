const academyRepository = require("./repositories/academyRepository");
const academyFeeRepository = require("./repositories/academyFeeRepository");
const academyProgramRepository = require("./repositories/academyProgramRepository");
const academyBatchRepository = require("./repositories/academyBatchRepository");
const { SupplierService } = require("../supplier/index");
const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../../database");
const academySearchRepository = require("./repositories/academySearchRepository");
const academyMetricsRepository = require("./repositories/academyMetricsRepository");
const academyFeedbackRepository = require("./repositories/academyFeedbackRepository");
const academyBookingRepository = require("./repositories/academyBookingRepository");
const academyCoachService = require("./academyCoachService");
const feedbackService = require("../feedback");
const academyInvitationService = require("./academyInvitationService");
const scoreService = require("../score/scoreService");

// Fix the import path - import directly from database instead of database/models
const { AcademyStudent, AcademyProfile } = require("../../database");

const getAcademyProfile = async (academyProfileId, options) => {
  const profile = await academyRepository.getAcademyProfileWithDetails(
    academyProfileId,
    options
  );
  if (!profile) throw new Error("Academy profile not found");
  return profile;
};

const getAcademiesBySupplier = async (supplierId) => {
  return await academyRepository.findAcademiesBySupplierId(supplierId);
};

const updateAcademyProfile = async (academyProfileId, updateData) => {
  const updated = await academyRepository.updateAcademyProfile(
    academyProfileId,
    updateData
  );
  if (!updated) throw new Error("Academy profile not found");
  return updated;
};

const deleteAcademyProfile = async (academyProfileId) => {
  const deleted = await academyRepository.deleteAcademyProfile(
    academyProfileId
  );
  if (!deleted) throw new Error("Academy profile not found");

  // Check if supplier has other academies
  const remainingAcademies = await academyRepository.findAcademiesBySupplierId(
    deleted.supplierId
  );
  if (remainingAcademies.length === 0) {
    await SupplierService.updateSupplierModule(deleted.supplierId, "none");
  }
  return deleted;
};

const getNearbyAcademies = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) throw new Error("Coordinates are required");
  return await academyRepository.findAcademiesNearby(
    latitude,
    longitude,
    radius
  );
};

const searchAcademies = async (filters) => {
  return await academySearchRepository.searchAcademies(filters);
};

// Student-related services
const getStudentsByAcademy = async (academyId, filters = {}) => {
  return await academyRepository.getStudentsByAcademy(academyId, filters);
};

const getStudentById = async (studentId) => {
  const student = await academyRepository.getStudentById(studentId);
  if (!student) throw new Error("Student not found");
  return student;
};

const createStudent = async (studentData) => {
  // Determine enrollment source based on provided IDs
  let enrollmentSource = "null";
  if (studentData.batchId && studentData.programId) {
    enrollmentSource = "both";
  } else if (studentData.batchId) {
    enrollmentSource = "batch";
  } else if (studentData.programId) {
    enrollmentSource = "program";
  }

  const student = await academyRepository.createStudent({
    ...studentData,
    studentId: uuidv4(),
    enrollmentSource,
    joinedDate: studentData.joinedDate || new Date(),
  });

  // If student is enrolled in a batch, update batch enrollment
  if (student.batchId) {
    await academyBatchRepository.enrollStudent(
      student.batchId,
      student.studentId
    );
  }

  // If student is enrolled in a program, update program enrollment
  if (student.programId) {
    await academyProgramRepository.enrollStudent(
      student.programId,
      student.studentId
    );
  }

  return student;
};

// Add permission checking middleware
const checkAcademyPermission = (requiredRole = "owner") => {
  return async (academyId, supplierId) => {
    const academy = await getAcademyProfile(academyId);

    if (!academy) {
      throw new Error("Academy not found");
    }

    // Check ownership
    if (academy.supplierId === supplierId) {
      return { allowed: true, role: "owner" };
    }

    // Check management permission
    if (requiredRole === "manager" || requiredRole === "owner") {
      if (
        academy.managerId === supplierId &&
        academy.managerInvitationStatus === "accepted"
      ) {
        return { allowed: true, role: "manager" };
      }
    }

    // Check coach permission
    if (requiredRole === "coach") {
      const { AcademyCoach } = require("../../database");
      const coachAssignment = await AcademyCoach.findOne({
        where: {
          academyId,
          supplierId,
          invitationStatus: "accepted",
        },
      });

      if (coachAssignment) {
        return { allowed: true, role: "coach" };
      }
    }

    return { allowed: false, role: null };
  };
};
const updateStudent = async (studentId, updateData, supplierId) => {
  const student = await academyRepository.getStudentById(studentId);
  if (!student) throw new Error("Student not found");

  // Check permissions
  const permission = await checkAcademyPermission("manager")(
    student.academyId,
    supplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to update this student");
  }
  // Handle enrollment source changes
  if (updateData.batchId !== undefined || updateData.programId !== undefined) {
    const newBatchId =
      updateData.batchId !== undefined ? updateData.batchId : student.batchId;
    const newProgramId =
      updateData.programId !== undefined
        ? updateData.programId
        : student.programId;

    if (newBatchId && newProgramId) {
      updateData.enrollmentSource = "both";
    } else if (newBatchId) {
      updateData.enrollmentSource = "batch";
    } else if (newProgramId) {
      updateData.enrollmentSource = "program";
    } else {
      updateData.enrollmentSource = "null";
    }

    // Handle batch enrollment changes
    if (
      updateData.batchId !== undefined &&
      updateData.batchId !== student.batchId
    ) {
      if (student.batchId) {
        // Unenroll from old batch
        await academyBatchRepository.unenrollStudent(
          student.batchId,
          studentId
        );
      }
      if (updateData.batchId) {
        // Enroll in new batch
        await academyBatchRepository.enrollStudent(
          updateData.batchId,
          studentId
        );
      }
    }

    // Handle program enrollment changes
    if (
      updateData.programId !== undefined &&
      updateData.programId !== student.programId
    ) {
      if (student.programId) {
        // Unenroll from old program
        await academyProgramRepository.unenrollStudent(
          student.programId,
          studentId
        );
      }
      if (updateData.programId) {
        // Enroll in new program
        await academyProgramRepository.enrollStudent(
          updateData.programId,
          studentId
        );
      }
    }
  }

  return await academyRepository.updateStudent(studentId, updateData);
};

const deleteStudent = async (studentId) => {
  const student = await academyRepository.getStudentById(studentId);
  if (!student) throw new Error("Student not found");

  // Unenroll from batch if enrolled
  if (student.batchId) {
    await academyBatchRepository.unenrollStudent(student.batchId, studentId);
  }

  // Unenroll from program if enrolled
  if (student.programId) {
    await academyProgramRepository.unenrollStudent(
      student.programId,
      studentId
    );
  }

  return await academyRepository.deleteStudent(studentId);
};

// Batch-related services
const createBatch = async (batchData, supplierId) => {
  const permission = await checkAcademyPermission("manager")(
    batchData.academyId,
    supplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to create batches for this academy");
  }

  return await academyBatchRepository.createBatch({
    ...batchData,
    batchId: uuidv4(),
  });
};

const getBatchById = async (batchId) => {
  const batch = await academyBatchRepository.getBatchById(batchId);
  if (!batch) throw new Error("Batch not found");
  return batch;
};

const getBatchesByAcademy = async (academyId, filters) => {
  return await academyBatchRepository.getBatchesByAcademy(academyId, filters);
};

const updateBatch = async (batchId, updateData) => {
  const updated = await academyBatchRepository.updateBatch(batchId, updateData);
  if (!updated) throw new Error("Batch not found");
  return updated;
};

const deleteBatch = async (batchId) => {
  const deleted = await academyBatchRepository.deleteBatch(batchId);
  if (!deleted) throw new Error("Batch not found");
  return deleted;
};

const getBatchStudents = async (batchId) => {
  return await academyBatchRepository.getEnrolledStudents(batchId);
};

const enrollStudentInBatch = async (batchId, studentData) => {
  const transaction = await sequelize.transaction();

  try {
    // Create or update student
    let student;
    if (studentData.studentId) {
      // Update existing student
      student = await academyRepository.updateStudent(
        studentData.studentId,
        {
          ...studentData,
          batchId,
          enrollmentSource: studentData.programId ? "both" : "batch",
        },
        transaction
      );

      if (!student) throw new Error("Student not found");
    } else {
      // Create new student
      student = await academyRepository.createStudent(
        {
          ...studentData,
          studentId: uuidv4(),
          batchId,
          enrollmentSource: studentData.programId ? "both" : "batch",
          joinedDate: new Date(),
        },
        transaction
      );
    }
    // Enroll student in batch
    await academyBatchRepository.enrollStudent(
      batchId,
      student.studentId,
      transaction
    );
    console.log("Student enrolled in batch:", student.studentId);
    await transaction.commit();
    return student;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const unEnrollStudentFromBatch = async (batchId, studentId) => {
  const transaction = await sequelize.transaction();

  try {
    // Get student first to check if they're enrolled in this batch
    const student = await academyRepository.getStudentById(studentId);
    if (!student) throw new Error("Student not found");
    if (student.batchId !== batchId)
      throw new Error("Student not enrolled in this batch");

    // Update student record
    const updatedStudent = await academyRepository.updateStudent(
      studentId,
      {
        batchId: null,
        enrollmentSource: student.programId ? "program" : "null",
      },
      transaction
    );

    // Remove from batch enrollment
    await academyBatchRepository.unenrollStudent(
      batchId,
      studentId,
      transaction
    );

    await transaction.commit();
    return updatedStudent;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAvailableBatches = async (filters) => {
  return await academyBatchRepository.getAvailableBatches(filters);
};

// Program-related services
const createProgram = async (programData) => {
  return await academyProgramRepository.createProgram({
    ...programData,
    programId: uuidv4(),
  });
};

const getProgramById = async (programId) => {
  const program = await academyProgramRepository.getProgramById(programId);
  if (!program) throw new Error("Program not found");
  return program;
};

const getProgramsByAcademy = async (academyId) => {
  return await academyProgramRepository.getProgramsByAcademy(academyId);
};

const updateProgram = async (programId, updateData) => {
  const updated = await academyProgramRepository.updateProgram(
    programId,
    updateData
  );
  if (!updated) throw new Error("Program not found");
  return updated;
};

const deleteProgram = async (programId) => {
  const deleted = await academyProgramRepository.deleteProgram(programId);
  if (!deleted) throw new Error("Program not found");
  return deleted;
};

const getEnrolledStudents = async (programId) => {
  return await academyProgramRepository.getEnrolledStudents(programId);
};

const enrollStudentInProgram = async (programId, studentData) => {
  const transaction = await sequelize.transaction();

  try {
    // Create or update student
    let student;
    if (studentData.studentId) {
      // Update existing student
      student = await academyRepository.updateStudent(
        studentData.studentId,
        {
          ...studentData,
          programId,
          enrollmentSource: studentData.batchId ? "both" : "program",
        },
        transaction
      );

      if (!student) throw new Error("Student not found");
    } else {
      // Create new student
      student = await academyRepository.createStudent(
        {
          ...studentData,
          studentId: uuidv4(),
          programId,
          enrollmentSource: studentData.batchId ? "both" : "program",
          joinedDate: new Date(),
        },
        transaction
      );
    }

    // Enroll student in program
    await academyProgramRepository.enrollStudent(
      programId,
      student.studentId,
      transaction
    );

    await transaction.commit();
    return student;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const unEnrollStudentFromProgram = async (programId, studentId) => {
  const transaction = await sequelize.transaction();

  try {
    // Get student first to check if they're enrolled in this batch
    const student = await academyRepository.getStudentById(studentId);
    if (!student) throw new Error("Student not found");
    if (student.programId !== programId)
      throw new Error("Student not enrolled in this program");

    // Update student record
    const updatedStudent = await academyRepository.updateStudent(
      studentId,
      {
        programId: null,
        enrollmentSource: student.batchId ? "batch" : "null",
      },
      transaction
    );

    // Remove from batch enrollment
    await academyProgramRepository.unenrollStudent(
      programId,
      studentId,
      transaction
    );

    await transaction.commit();
    return updatedStudent;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Fee-related services
const createFee = async (feeData) => {
  // Calculate total amount if not provided
  if (!feeData.totalAmount) {
    const amount = Number.parseFloat(feeData.amount || 0);
    const discount = Number.parseFloat(feeData.discountAmount || 0);
    const tax = Number.parseFloat(feeData.taxAmount || 0);
    feeData.totalAmount = amount - discount + tax;
  }

  return await academyFeeRepository.createFee({
    ...feeData,
    feeId: uuidv4(),
  });
};

const getFeeById = async (feeId) => {
  const fee = await academyFeeRepository.getFeeById(feeId);
  if (!fee) throw new Error("Fee record not found");
  return fee;
};

const getFeesByStudent = async (studentId) => {
  return await academyFeeRepository.getFeesByStudent(studentId);
};

const getFeesByAcademy = async (academyId, filters) => {
  return await academyFeeRepository.getFeesByAcademy(academyId, filters);
};

const updateFee = async (feeId, updateData) => {
  // If amount components are updated, recalculate total
  if (updateData.amount || updateData.discountAmount || updateData.taxAmount) {
    const fee = await academyFeeRepository.getFeeById(feeId);
    if (!fee) throw new Error("Fee record not found");

    const amount = Number.parseFloat(updateData.amount || fee.amount);
    const discount = Number.parseFloat(
      updateData.discountAmount || fee.discountAmount
    );
    const tax = Number.parseFloat(updateData.taxAmount || fee.taxAmount);
    updateData.totalAmount = amount - discount + tax;
  }

  const updated = await academyFeeRepository.updateFee(feeId, updateData);
  if (!updated) throw new Error("Fee record not found");
  return updated;
};

const deleteFee = async (feeId) => {
  const deleted = await academyFeeRepository.deleteFee(feeId);
  if (!deleted) throw new Error("Fee record not found");
  return deleted;
};

const recordFeePayment = async (feeId, paymentData) => {
  const updated = await academyFeeRepository.recordPayment(feeId, paymentData);
  if (!updated) throw new Error("Fee record not found");
  return updated;
};

const getOverdueFees = async () => {
  return await academyFeeRepository.getOverdueFees();
};

const getStudentAchievements = async (academyId, studentId) => {
  const query = {};

  if (academyId) {
    query.academyId = academyId;
  }

  if (studentId) {
    query.studentId = studentId;
  }

  const students = await AcademyStudent.findAll({
    where: query,
    attributes: ["studentId", "name", "academyId", "achievements"],
    raw: true,
  });

  return students.map((student) => ({
    studentId: student.studentId,
    name: student.name,
    academyId: student.academyId,
    achievements: student.achievements || [],
  }));
};

const getStudentFeedback = async (academyId, studentId) => {
  const query = {};

  if (academyId) {
    query.academyId = academyId;
  }

  if (studentId) {
    query.studentId = studentId;
  }

  const students = await AcademyStudent.findAll({
    where: query,
    attributes: ["studentId", "name", "academyId", "coachFeedback"],
    raw: true,
  });

  return students.map((student) => ({
    studentId: student.studentId,
    name: student.name,
    academyId: student.academyId,
    feedback: student.coachFeedback || [],
  }));
};

const getAcademiesByUser = async (userId) => {
  // Find all academies where this user is enrolled as a student
  const enrollments = await AcademyStudent.findAll({
    where: { userId },
    include: [
      {
        model: AcademyProfile,
        as: "academy",
        attributes: ["academyProfileId", "name", "sport", "location"],
      },
    ],
  });

  // Extract and return the academy information
  return enrollments.map((enrollment) => enrollment.academy);
};

// Record a profile view
// Add this to recordProfileView in academyService.js
const recordProfileView = async (academyId, viewData = {}) => {
  const view = await academyMetricsRepository.recordProfileView({
    viewId: uuidv4(),
    academyId,
    ...viewData,
  });

  // Increment the monthly metrics counter for views
  try {
    const now = new Date();
    const currentMonth = await sequelize.models.Month.findOne({
      where: {
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    if (currentMonth) {
      await academyMetricsRepository.incrementMetricCounter(
        academyId,
        currentMonth.monthId,
        "profileViews"
      );
    }
  } catch (err) {
    console.error("Error updating monthly metrics:", err);
  }

  return view;
};

// Create an inquiry
const createInquiry = async (inquiryData) => {
  return await academyMetricsRepository.createInquiry({
    inquiryId: uuidv4(),
    ...inquiryData,
  });
};
// Mark inquiry as converted when student enrolls
const convertInquiryToStudent = async (inquiryId, studentId) => {
  const inquiry = await academyMetricsRepository.updateInquiry(inquiryId, {
    status: "enrolled",
    convertedToStudent: true,
    convertedStudentId: studentId,
  });

  // Update metrics for the current month
  const now = new Date();
  const currentMonth = await sequelize.models.Month.findOne({
    where: {
      monthNumber: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  if (currentMonth) {
    await academyMetricsRepository.calculateConversionRate(
      inquiry.academyId,
      currentMonth.monthId
    );
  }

  return inquiry;
};
// Get monthly metrics
const getMonthlyMetrics = async (academyId, filters = {}) => {
  return await academyMetricsRepository.getMonthlyMetrics(academyId, filters);
};

// Get program specific monthly metrics
const getProgramMonthlyMetrics = async (programId, monthId) => {
  const program = await academyProgramRepository.getProgramById(programId);
  if (!program) throw new Error("Program not found");

  const metric = await academyMetricsRepository.getOrCreateMonthlyMetric(
    program.academyId,
    monthId
  );

  // Return the program specific metrics from the JSON field
  return (
    metric.programMetrics[programId] || {
      totalBookings: 0,
      completedSessions: 0,
      revenue: 0,
      students: 0,
      rating: 0,
      reviews: 0,
    }
  );
};

// Get conversion rate
const getConversionRate = async (academyId, monthId) => {
  return await academyMetricsRepository.calculateConversionRate(
    academyId,
    monthId
  );
};

// Add this function to the file, before the module.exports
const getAcademyCoachFeedback = async (academyId) => {
  // Verify academy exists
  const academy = await academyRepository.findAcademyProfileById(academyId);
  if (!academy) throw new Error("Academy not found");

  return await academyFeedbackRepository.getAcademyCoachFeedback(academyId);
};

const getBookingPlatforms = async (academyId, period = 3) => {
  // Validate that academy exists
  const academy = await academyRepository.findAcademyProfileById(academyId);
  if (!academy) {
    throw new Error("Academy not found");
  }

  // Get booking platform data
  const bookingData = await academyBookingRepository.getBookingPlatforms(
    academyId,
    period
  );

  // Calculate total bookings and percentages
  const totalBookings = bookingData.reduce((sum, platform) => {
    return sum + parseInt(platform.dataValues.totalBookings);
  }, 0);

  // Format the response data
  const platforms = bookingData.map((platform) => {
    const count = parseInt(platform.dataValues.totalBookings);
    return {
      name: platform.platformName,
      count: count,
      percentage: totalBookings
        ? parseFloat(((count / totalBookings) * 100).toFixed(1))
        : 0,
    };
  });

  return {
    platforms,
    totalBookings,
  };
};
const recordBookingPlatform = async (
  academyId,
  platformName,
  monthId = null,
  count = 1
) => {
  // Validate that academy exists
  const academy = await academyRepository.findAcademyProfileById(academyId);
  if (!academy) {
    throw new Error("Academy not found");
  }

  // If monthId is not provided, get current month
  if (!monthId) {
    const now = new Date();
    const currentMonth = await sequelize.models.Month.findOne({
      where: {
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    if (currentMonth) {
      monthId = currentMonth.monthId;
    }
  }

  return await academyBookingRepository.recordBookingPlatform({
    academyId,
    monthId,
    platformName,
    count,
  });
};

// Add to academyService.js
const getPopularPrograms = async (academyId, limit = 5) => {
  // Verify academy exists
  const academy = await academyRepository.findAcademyProfileById(academyId);
  if (!academy) throw new Error("Academy not found");

  // Get popular programs
  const programs = await academyProgramRepository.getPopularProgramsByAcademy(
    academyId,
    limit
  );

  // Get fee records for revenue calculation
  const lastThreeMonths = new Date();
  lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);

  // Calculate and format response
  const result = await Promise.all(
    programs.map(async (program) => {
      // Get revenue data - optional if you have academy fee data
      const fees = await academyFeeRepository.getFeesByProgram(
        program.programId,
        {
          createdAfter: lastThreeMonths,
          status: "paid",
        }
      );

      // Calculate total revenue from fees
      const revenue = fees.reduce(
        (total, fee) => total + Number(fee.totalAmount),
        0
      );

      // Count enrollments
      const enrollments = program.enrolledStudents
        ? program.enrolledStudents.length
        : 0;

      // Calculate growth - compare with previous period
      // This is simplified - you might want to implement a more sophisticated approach
      const prevPeriodFees = await academyFeeRepository.getFeesByProgram(
        program.programId,
        {
          createdAfter: new Date(
            lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3)
          ),
          createdBefore: lastThreeMonths,
          status: "paid",
        }
      );

      const prevRevenue = prevPeriodFees.reduce(
        (total, fee) => total + Number(fee.totalAmount),
        0
      );
      const growth =
        prevRevenue > 0
          ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
          : 0;

      return {
        id: program.programId,
        name: program.programName,
        enrollments,
        revenue,
        growth,
        sport: program.sport,
      };
    })
  );

  return { programs: result };
};

const getAcademyWithFeedback = async (academyId) => {
  try {
    const academy = await academyRepository.getAcademyById(academyId);
    const [feedback, analytics] = await Promise.all([
      feedbackService.getRecentFeedback("academy", academyId, 5),
      feedbackService.getFeedbackAnalytics("academy", academyId),
    ]);

    return {
      ...academy,
      recentFeedback: feedback,
      feedbackAnalytics: analytics,
    };
  } catch (error) {
    throw new Error(`Failed to get academy with feedback: ${error.message}`);
  }
};
// Update createAcademyProfile function around line 20
const createAcademyProfile = async (supplierId, profileData) => {
  const { manager, ...academyData } = profileData;

  const academy = await academyProfileRepository.createAcademyProfile(
    supplierId,
    {
      ...academyData,
      academyId: uuidv4(),
    }
  );

  // If manager is provided, send invitation instead of creating directly
  if (manager && manager.phoneNumber) {
    try {
      await academyInvitationService.inviteManager(
        academy.academyProfileId,
        supplierId,
        manager
      );
    } catch (error) {
      console.error("Failed to send manager invitation:", error);
      // Don't fail academy creation if invitation fails
    }
  }

  return academy;
};

// Add new functions for invitation management
const inviteManager = async (academyId, inviterSupplierId, managerData) => {
  return await academyInvitationService.inviteManager(
    academyId,
    inviterSupplierId,
    managerData
  );
};

const inviteCoach = async (academyId, inviterSupplierId, coachData) => {
  return await academyInvitationService.inviteCoach(
    academyId,
    inviterSupplierId,
    coachData
  );
};

const acceptInvitation = async (invitationToken, supplierId) => {
  return await academyInvitationService.acceptInvitation(
    invitationToken,
    supplierId
  );
};

const rejectInvitation = async (invitationToken, supplierId) => {
  return await academyInvitationService.rejectInvitation(
    invitationToken,
    supplierId
  );
};

const getSupplierInvitations = async (supplierId, status = null) => {
  return await academyInvitationService.getSupplierInvitations(
    supplierId,
    status
  );
};

// Add coach invitation functions (delegated to invitation service)
const inviteCoachToAcademy = async (
  academyId,
  inviterSupplierId,
  coachData
) => {
  const permission = await checkAcademyPermission("manager")(
    academyId,
    inviterSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to invite coaches to this academy");
  }

  return await academyInvitationService.inviteCoach(
    academyId,
    inviterSupplierId,
    coachData
  );
};

const getAcademyWithPromotionStatus = async (academyProfileId, options) => {
  const profile = await academyRepository.getAcademyProfileWithDetails(
    academyProfileId,
    options
  );
  if (!profile) throw new Error("Academy profile not found");

  return {
    ...profile.toJSON(),
    promotionStatus: {
      isPromoted: profile.priority?.value > 0,
      plan: profile.priority?.plan || "none",
      expiresAt: profile.priority?.expiresAt,
    },
  };
};
const refreshMetrics = async (academyId, monthId) => {
  // You can call recalculateMetricsFromSessions and calculateConversionRate for full refresh
  await academyMetricsRepository.recalculateMetricsFromSessions(
    academyId,
    monthId
  );
  await academyMetricsRepository.calculateConversionRate(academyId, monthId);
};

// Add score-related methods
const updateStudentScore = async (
  academyId,
  studentId,
  scoreData,
  assessorId
) => {
  try {
    // Verify student belongs to this academy
    const student = await academyRepository.getStudentById(studentId);
    if (!student || student.academyId !== academyId) {
      throw new Error("Student not found in this academy");
    }

    // Update scores using score service
    const result = await scoreService.updateStudentScore(
      studentId,
      "academy",
      scoreData,
      assessorId,
      "academy_coach"
    );

    // Check and award automatic achievements
    const achievements = await scoreService.checkAndAwardAutoAchievements(
      studentId,
      "academy",
      scoreData.currentScores || scoreData.sportScores
    );

    return {
      ...result,
      achievements,
    };
  } catch (error) {
    throw new Error(`Failed to update student score: ${error.message}`);
  }
};

const getStudentScoreAnalytics = async (academyId, studentId, months = 6) => {
  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  return await scoreService.getStudentScoreAnalytics(
    studentId,
    "academy",
    months
  );
};

const getBatchScoreAnalytics = async (academyId, batchId) => {
  // Verify batch belongs to this academy
  const batch = await academyBatchRepository.getBatchById(batchId);
  if (!batch || batch.academyId !== academyId) {
    throw new Error("Batch not found in this academy");
  }

  return await scoreService.getBatchScoreAnalytics(batchId);
};

const getProgramScoreAnalytics = async (academyId, programId) => {
  // Verify program belongs to this academy
  const program = await academyProgramRepository.getProgramById(programId);
  if (!program || program.academyId !== academyId) {
    throw new Error("Program not found in this academy");
  }

  return await scoreService.getProgramScoreAnalytics(programId);
};

const getStudentsWithScoreAnalytics = async (academyId, filters = {}) => {
  return await academyRepository.getStudentsWithScoreAnalytics(
    academyId,
    filters
  );
};

const awardStudentAchievement = async (academyId, studentId, achievement) => {
  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  return await scoreService.awardAchievement(studentId, "academy", achievement);
};

const getAcademyScoreOverview = async (academyId) => {
  const students = await getStudentsWithScoreAnalytics(academyId, {
    includeScoreTrends: true,
  });

  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      scoreDistribution: {},
      topPerformers: [],
      insights: ["No students found for analysis"],
    };
  }

  // Calculate overall academy metrics
  const studentsWithScores = students.filter(
    (s) => s.currentScores && typeof s.currentScores.overall === "number"
  );

  const totalScore = studentsWithScores.reduce(
    (sum, student) => sum + (student.currentScores.overall || 0),
    0
  );

  const averageScore =
    studentsWithScores.length > 0
      ? (totalScore / studentsWithScores.length).toFixed(2)
      : 0;

  const scoreDistribution = {
    excellent: studentsWithScores.filter((s) => s.currentScores.overall >= 8.5)
      .length,
    good: studentsWithScores.filter(
      (s) => s.currentScores.overall >= 7.0 && s.currentScores.overall < 8.5
    ).length,
    average: studentsWithScores.filter(
      (s) => s.currentScores.overall >= 5.0 && s.currentScores.overall < 7.0
    ).length,
    needsWork: studentsWithScores.filter((s) => s.currentScores.overall < 5.0)
      .length,
  };

  const topPerformers = studentsWithScores
    .sort(
      (a, b) => (b.currentScores.overall || 0) - (a.currentScores.overall || 0)
    )
    .slice(0, 10)
    .map((student) => ({
      studentId: student.studentId,
      name: student.name,
      score: student.currentScores.overall,
      sport: student.sport,
      achievements: student.achievementBadges?.length || 0,
    }));

  const insights = [];

  if (scoreDistribution.excellent > students.length * 0.3) {
    insights.push("Academy demonstrates excellent overall performance");
  }

  if (scoreDistribution.needsWork > students.length * 0.2) {
    insights.push("Consider implementing additional support programs");
  }

  if (parseFloat(averageScore) > 8.0) {
    insights.push("Academy maintains high performance standards");
  }

  return {
    totalStudents: students.length,
    studentsWithScores: studentsWithScores.length,
    averageScore: parseFloat(averageScore),
    scoreDistribution,
    topPerformers,
    insights,
  };
};

const bulkUpdateStudentScores = async (
  academyId,
  studentsScoreData,
  assessorId
) => {
  // Verify all students belong to this academy
  const studentIds = studentsScoreData.map((s) => s.studentId);
  const students = await AcademyStudent.findAll({
    where: {
      studentId: { [Op.in]: studentIds },
      academyId,
    },
  });

  if (students.length !== studentIds.length) {
    throw new Error("Some students not found in this academy");
  }

  // Prepare data for bulk update
  const studentsData = studentsScoreData.map((studentScore) => ({
    studentId: studentScore.studentId,
    studentType: "academy",
    scoreData: studentScore.scoreData,
  }));

  return await scoreService.bulkUpdateScores(
    studentsData,
    assessorId,
    "academy_coach"
  );
};

// Add progress tracking methods after existing score methods
const updateStudentQuarterlyProgress = async (
  academyId,
  studentId,
  year,
  quarter,
  progressData,
  updaterSupplierId
) => {
  // Check permissions
  const permission = await checkAcademyPermission("coach")(
    academyId,
    updaterSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to update student progress");
  }

  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  // Validate quarter data structure
  const validatedData = {
    ...progressData,
    updatedBy: updaterSupplierId,
    lastUpdated: new Date().toISOString(),
  };

  return await academyRepository.updateQuarterlyProgress(
    studentId,
    year,
    quarter,
    validatedData
  );
};

const getStudentQuarterlyProgress = async (
  academyId,
  studentId,
  year = null,
  quarter = null
) => {
  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  return await academyRepository.getQuarterlyProgress(studentId, year, quarter);
};

const generateStudentQuarterlyReport = async (
  academyId,
  studentId,
  year,
  quarter,
  generatorSupplierId
) => {
  // Check permissions
  const permission = await checkAcademyPermission("coach")(
    academyId,
    generatorSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to generate reports");
  }

  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  const report = await academyRepository.generateQuarterlyReport(
    studentId,
    year,
    quarter
  );

  // Log report generation for audit
  console.log(
    `Quarterly report generated for student ${studentId} by supplier ${generatorSupplierId}`
  );

  return report;
};

const updateStudentProgressMilestones = async (
  academyId,
  studentId,
  sport,
  level,
  achieved = true,
  updaterSupplierId
) => {
  // Check permissions
  const permission = await checkAcademyPermission("coach")(
    academyId,
    updaterSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to update milestones");
  }

  // Verify student belongs to this academy
  const student = await academyRepository.getStudentById(studentId);
  if (!student || student.academyId !== academyId) {
    throw new Error("Student not found in this academy");
  }

  return await academyRepository.updateProgressMilestones(
    studentId,
    sport,
    level,
    achieved
  );
};

const getAcademyProgressAnalytics = async (
  academyId,
  filters = {},
  requesterSupplierId
) => {
  // Check permissions
  const permission = await checkAcademyPermission("manager")(
    academyId,
    requesterSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to view academy analytics");
  }

  return await academyRepository.getProgressAnalytics(academyId, filters);
};

const getBatchProgressAnalytics = async (academyId, batchId, filters = {}) => {
  // Verify batch belongs to this academy
  const batch = await academyBatchRepository.getBatchById(batchId);
  if (!batch || batch.academyId !== academyId) {
    throw new Error("Batch not found in this academy");
  }

  // Get all students in the batch
  const students = await academyRepository.getStudentsByAcademy(academyId, {
    batchId,
  });

  const { year, quarter } = filters;
  const progressData = {
    batchInfo: {
      batchId: batch.batchId,
      batchName: batch.batchName,
      sport: batch.sport,
      level: batch.level,
      totalStudents: students.students.length,
    },
    studentProgress: [],
    batchAverages: {
      overallImprovement: 0,
      skillAverages: {},
      attendanceRate: 0,
      achievementsCount: 0,
    },
  };

  let totalImprovement = 0;
  let studentsWithProgress = 0;
  let totalAttendance = 0;
  let totalAchievements = 0;
  const skillTotals = {};

  // Analyze each student's progress
  for (const student of students.students) {
    const studentProgress = await academyRepository.getQuarterlyProgress(
      student.studentId,
      year,
      quarter
    );

    if (studentProgress && Object.keys(studentProgress).length > 0) {
      const studentData = {
        studentId: student.studentId,
        name: student.name,
        progress: studentProgress,
      };

      // Calculate improvements for this student
      Object.entries(studentProgress).forEach(([sport, data]) => {
        if (data.overallScore?.improvement) {
          totalImprovement += data.overallScore.improvement;
          studentsWithProgress++;
        }

        if (data.attendance?.percentage) {
          totalAttendance += data.attendance.percentage;
        }

        if (data.achievements?.length) {
          totalAchievements += data.achievements.length;
        }

        if (data.skills) {
          Object.entries(data.skills).forEach(([skill, skillData]) => {
            if (!skillTotals[skill]) {
              skillTotals[skill] = { total: 0, count: 0 };
            }
            if (skillData.improvement) {
              skillTotals[skill].total += skillData.improvement;
              skillTotals[skill].count++;
            }
          });
        }
      });

      progressData.studentProgress.push(studentData);
    }
  }

  // Calculate batch averages
  const studentsCount = students.students.length;
  if (studentsCount > 0) {
    progressData.batchAverages.overallImprovement =
      studentsWithProgress > 0 ? totalImprovement / studentsWithProgress : 0;
    progressData.batchAverages.attendanceRate = totalAttendance / studentsCount;
    progressData.batchAverages.achievementsCount =
      totalAchievements / studentsCount;

    // Calculate skill averages
    Object.entries(skillTotals).forEach(([skill, data]) => {
      progressData.batchAverages.skillAverages[skill] =
        data.count > 0 ? data.total / data.count : 0;
    });
  }

  return progressData;
};

const getProgramProgressAnalytics = async (
  academyId,
  programId,
  filters = {}
) => {
  // Verify program belongs to this academy
  const program = await academyProgramRepository.getProgramById(programId);
  if (!program || program.academyId !== academyId) {
    throw new Error("Program not found in this academy");
  }

  // Get all students in the program
  const students = await academyRepository.getStudentsByAcademy(academyId, {
    programId,
  });

  const { year, quarter } = filters;
  const progressData = {
    programInfo: {
      programId: program.programId,
      programName: program.programName,
      sport: program.sport,
      duration: program.duration,
      totalStudents: students.students.length,
    },
    studentProgress: [],
    programAverages: {
      overallImprovement: 0,
      skillAverages: {},
      completionRate: 0,
      satisfactionScore: 0,
    },
    graduationReadiness: {
      readyForAdvancement: 0,
      requiresMoreTime: 0,
      totalAssessed: 0,
    },
  };

  let totalImprovement = 0;
  let studentsWithProgress = 0;
  let readyForAdvancement = 0;

  // Analyze each student's progress
  for (const student of students.students) {
    const studentProgress = await academyRepository.getQuarterlyProgress(
      student.studentId,
      year,
      quarter
    );

    if (studentProgress && Object.keys(studentProgress).length > 0) {
      const studentData = {
        studentId: student.studentId,
        name: student.name,
        progress: studentProgress,
        readinessScore: 0,
      };

      // Assess graduation readiness
      Object.entries(studentProgress).forEach(([sport, data]) => {
        if (data.overallScore?.current >= 8.0) {
          studentData.readinessScore += 1;
        }

        if (data.overallScore?.improvement) {
          totalImprovement += data.overallScore.improvement;
          studentsWithProgress++;
        }
      });

      if (studentData.readinessScore >= 1) {
        readyForAdvancement++;
      }

      progressData.studentProgress.push(studentData);
    }
  }

  // Calculate program averages
  const studentsCount = students.students.length;
  if (studentsCount > 0) {
    progressData.programAverages.overallImprovement =
      studentsWithProgress > 0 ? totalImprovement / studentsWithProgress : 0;

    progressData.graduationReadiness = {
      readyForAdvancement,
      requiresMoreTime: studentsCount - readyForAdvancement,
      totalAssessed: studentsCount,
    };
  }

  return progressData;
};

const generateBulkQuarterlyReports = async (
  academyId,
  year,
  quarter,
  filters = {},
  generatorSupplierId
) => {
  // Check permissions
  const permission = await checkAcademyPermission("manager")(
    academyId,
    generatorSupplierId
  );
  if (!permission.allowed) {
    throw new Error("Unauthorized to generate bulk reports");
  }

  const { batchId, programId, sport } = filters;

  // Get students based on filters
  const studentsData = await academyRepository.getStudentsByAcademy(academyId, {
    batchId,
    programId,
    sport,
  });

  const reports = [];
  const errors = [];

  // Generate reports for each student
  for (const student of studentsData.students) {
    try {
      const report = await academyRepository.generateQuarterlyReport(
        student.studentId,
        year,
        quarter
      );
      reports.push(report);
    } catch (error) {
      errors.push({
        studentId: student.studentId,
        studentName: student.name,
        error: error.message,
      });
    }
  }

  console.log(
    `Bulk quarterly reports generated: ${reports.length} successful, ${errors.length} failed`
  );

  return {
    successful: reports,
    failed: errors,
    summary: {
      total: studentsData.students.length,
      successful: reports.length,
      failed: errors.length,
    },
  };
};

module.exports = {
  createAcademyProfile,
  getAcademyProfile,
  getAcademiesBySupplier,
  updateAcademyProfile,
  deleteAcademyProfile,
  getNearbyAcademies,
  searchAcademies,

  getAcademyWithPromotionStatus, // Add this line

  //invitation management exports
  inviteManager,
  inviteCoach,
  acceptInvitation,
  rejectInvitation,
  getSupplierInvitations,
  checkAcademyPermission,
  inviteCoachToAcademy,
  // Student-related exports
  getStudentsByAcademy,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  // Batch-related exports
  createBatch,
  getBatchById,
  getBatchesByAcademy,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  enrollStudentInBatch,
  unEnrollStudentFromBatch,
  getAvailableBatches,
  // Program-related exports
  createProgram,
  getProgramById,
  getProgramsByAcademy,
  updateProgram,
  deleteProgram,
  getEnrolledStudents,
  enrollStudentInProgram,
  unEnrollStudentFromProgram,
  // Fee-related exports
  createFee,
  getFeeById,
  getFeesByStudent,
  getFeesByAcademy,
  updateFee,
  deleteFee,
  recordFeePayment,
  getOverdueFees,
  getStudentAchievements,
  getStudentFeedback,
  getAcademiesByUser,
  // Metrics related exports
  recordProfileView,
  createInquiry,
  convertInquiryToStudent,
  getMonthlyMetrics,
  getProgramMonthlyMetrics,
  getConversionRate,
  getAcademyCoachFeedback,
  getBookingPlatforms,
  recordBookingPlatform,
  getPopularPrograms,
  getAcademyWithFeedback,
  refreshMetrics,

  // Academy Coach exports
  academyCoachService,
  createAcademyCoach: academyCoachService.createCoach.bind(academyCoachService),
  getAcademyCoach: academyCoachService.getCoachById.bind(academyCoachService),
  getAcademyCoaches:
    academyCoachService.getCoachesByAcademy.bind(academyCoachService),
  updateAcademyCoach: academyCoachService.updateCoach.bind(academyCoachService),
  deleteAcademyCoach: academyCoachService.deleteCoach.bind(academyCoachService),
  getCoachSchedule:
    academyCoachService.getCoachSchedule.bind(academyCoachService),
  getCoachBatchesAndPrograms:
    academyCoachService.getCoachBatchesAndPrograms.bind(academyCoachService),

  // score-related exports
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
