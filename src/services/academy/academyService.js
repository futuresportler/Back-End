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
const academyInvitationService = require('./academyInvitationService');

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
const checkAcademyPermission = (requiredRole = 'owner') => {
  return async (academyId, supplierId) => {
    const academy = await getAcademyProfile(academyId);
    
    if (!academy) {
      throw new Error("Academy not found");
    }
    
    // Check ownership
    if (academy.supplierId === supplierId) {
      return { allowed: true, role: 'owner' };
    }
    
    // Check management permission
    if (requiredRole === 'manager' || requiredRole === 'owner') {
      if (academy.managerId === supplierId && academy.managerInvitationStatus === 'accepted') {
        return { allowed: true, role: 'manager' };
      }
    }
    
    // Check coach permission
    if (requiredRole === 'coach') {
      const { AcademyCoach } = require("../../database");
      const coachAssignment = await AcademyCoach.findOne({
        where: {
          academyId,
          supplierId,
          invitationStatus: 'accepted'
        }
      });
      
      if (coachAssignment) {
        return { allowed: true, role: 'coach' };
      }
    }
    
    return { allowed: false, role: null };
  };
};
const updateStudent = async (studentId, updateData,supplierId) => {
  const student = await academyRepository.getStudentById(studentId);
  if (!student) throw new Error("Student not found");

  // Check permissions
  const permission = await checkAcademyPermission('manager')(student.academyId, supplierId);
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
    const permission = await checkAcademyPermission('manager')(batchData.academyId, supplierId);
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
    ...viewData
  });
  
  // Increment the monthly metrics counter for views
  try {
    const now = new Date();
    const currentMonth = await sequelize.models.Month.findOne({
      where: {
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear()
      }
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
    ...inquiryData
  });
};
// Mark inquiry as converted when student enrolls
const convertInquiryToStudent = async (inquiryId, studentId) => {
  const inquiry = await academyMetricsRepository.updateInquiry(inquiryId, {
    status: "enrolled",
    convertedToStudent: true,
    convertedStudentId: studentId
  });
  
  // Update metrics for the current month
  const now = new Date();
  const currentMonth = await sequelize.models.Month.findOne({
    where: {
      monthNumber: now.getMonth() + 1,
      year: now.getFullYear()
    }
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
  return metric.programMetrics[programId] || {
    totalBookings: 0,
    completedSessions: 0,
    revenue: 0,
    students: 0,
    rating: 0,
    reviews: 0
  };
};

// Get conversion rate
const getConversionRate = async (academyId, monthId) => {
  return await academyMetricsRepository.calculateConversionRate(academyId, monthId);
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
  const bookingData = await academyBookingRepository.getBookingPlatforms(academyId, period);
  
  // Calculate total bookings and percentages
  const totalBookings = bookingData.reduce((sum, platform) => {
    return sum + parseInt(platform.dataValues.totalBookings);
  }, 0);
  
  // Format the response data
  const platforms = bookingData.map(platform => {
    const count = parseInt(platform.dataValues.totalBookings);
    return {
      name: platform.platformName,
      count: count,
      percentage: totalBookings ? parseFloat(((count / totalBookings) * 100).toFixed(1)) : 0
    };
  });

  return {
    platforms,
    totalBookings
  };
};
const recordBookingPlatform = async (academyId, platformName, monthId = null, count = 1) => {
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
        year: now.getFullYear()
      }
    });
    
    if (currentMonth) {
      monthId = currentMonth.monthId;
    }
  }

  return await academyBookingRepository.recordBookingPlatform({
    academyId,
    monthId,
    platformName,
    count
  });
};

// Add to academyService.js
const getPopularPrograms = async (academyId, limit = 5) => {
  // Verify academy exists
  const academy = await academyRepository.findAcademyProfileById(academyId);
  if (!academy) throw new Error("Academy not found");
  
  // Get popular programs
  const programs = await academyProgramRepository.getPopularProgramsByAcademy(academyId, limit);
  
  // Get fee records for revenue calculation
  const lastThreeMonths = new Date();
  lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);
  
  // Calculate and format response
  const result = await Promise.all(programs.map(async (program) => {
    // Get revenue data - optional if you have academy fee data
    const fees = await academyFeeRepository.getFeesByProgram(program.programId, {
      createdAfter: lastThreeMonths,
      status: 'paid'
    });
    
    // Calculate total revenue from fees
    const revenue = fees.reduce((total, fee) => total + Number(fee.totalAmount), 0);
    
    // Count enrollments
    const enrollments = program.enrolledStudents ? program.enrolledStudents.length : 0;
    
    // Calculate growth - compare with previous period
    // This is simplified - you might want to implement a more sophisticated approach
    const prevPeriodFees = await academyFeeRepository.getFeesByProgram(program.programId, {
      createdAfter: new Date(lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3)),
      createdBefore: lastThreeMonths,
      status: 'paid'
    });
    
    const prevRevenue = prevPeriodFees.reduce((total, fee) => total + Number(fee.totalAmount), 0);
    const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0;
    
    return {
      id: program.programId,
      name: program.programName,
      enrollments,
      revenue,
      growth,
      sport: program.sport
    };
  }));
  
  return { programs: result };
};

const getAcademyWithFeedback = async (academyId) => {
  try {
    const academy = await academyRepository.getAcademyById(academyId);
    const [feedback, analytics] = await Promise.all([
      feedbackService.getRecentFeedback('academy', academyId, 5),
      feedbackService.getFeedbackAnalytics('academy', academyId)
    ]);
    
    return {
      ...academy,
      recentFeedback: feedback,
      feedbackAnalytics: analytics
    };
  } catch (error) {
    throw new Error(`Failed to get academy with feedback: ${error.message}`);
  }
};
// Update createAcademyProfile function around line 20
const createAcademyProfile = async (supplierId, profileData) => {
  const { manager, ...academyData } = profileData;
  
  const academy = await academyProfileRepository.createAcademyProfile(supplierId, {
    ...academyData,
    academyId: uuidv4(),
  });

  // If manager is provided, send invitation instead of creating directly
  if (manager && manager.phoneNumber) {
    try {
      await academyInvitationService.inviteManager(
        academy.academyProfileId,
        supplierId,
        manager
      );
    } catch (error) {
      console.error('Failed to send manager invitation:', error);
      // Don't fail academy creation if invitation fails
    }
  }

  return academy;
};

// Add new functions for invitation management
const inviteManager = async (academyId, inviterSupplierId, managerData) => {
  return await academyInvitationService.inviteManager(academyId, inviterSupplierId, managerData);
};

const inviteCoach = async (academyId, inviterSupplierId, coachData) => {
  return await academyInvitationService.inviteCoach(academyId, inviterSupplierId, coachData);
};

const acceptInvitation = async (invitationToken, supplierId) => {
  return await academyInvitationService.acceptInvitation(invitationToken, supplierId);
};

const rejectInvitation = async (invitationToken, supplierId) => {
  return await academyInvitationService.rejectInvitation(invitationToken, supplierId);
};

const getSupplierInvitations = async (supplierId, status = null) => {
  return await academyInvitationService.getSupplierInvitations(supplierId, status);
};

// Add coach invitation functions (delegated to invitation service)
const inviteCoachToAcademy = async (academyId, inviterSupplierId, coachData) => {
  const permission = await checkAcademyPermission('manager')(academyId, inviterSupplierId);
  if (!permission.allowed) {
    throw new Error("Unauthorized to invite coaches to this academy");
  }
  
  return await academyInvitationService.inviteCoach(academyId, inviterSupplierId, coachData);
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
      expiresAt: profile.priority?.expiresAt
    }
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

    // Academy Coach exports
  academyCoachService,
  createAcademyCoach: academyCoachService.createCoach.bind(academyCoachService),
  getAcademyCoach: academyCoachService.getCoachById.bind(academyCoachService),
  getAcademyCoaches: academyCoachService.getCoachesByAcademy.bind(academyCoachService),
  updateAcademyCoach: academyCoachService.updateCoach.bind(academyCoachService),
  deleteAcademyCoach: academyCoachService.deleteCoach.bind(academyCoachService),
  getCoachSchedule: academyCoachService.getCoachSchedule.bind(academyCoachService),
  getCoachBatchesAndPrograms: academyCoachService.getCoachBatchesAndPrograms.bind(academyCoachService)


};
