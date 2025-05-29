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

// Add score-related methods
const updateStudentScore = async (coachId, studentId, scoreData) => {
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  // Update current scores
  const updatedScores = {
    ...student.currentScores,
    ...scoreData.currentScores,
  };

  // Update score history
  const updatedHistory = {
    ...student.scoreHistory,
    ...scoreData.scoreHistory,
  };

  return await coachRepository.updateCoachStudent(student.id, {
    currentScores: updatedScores,
    scoreHistory: updatedHistory,
    achievementFlags: scoreData.achievementFlags || student.achievementFlags,
  });
};

const getStudentScoreHistory = async (coachId, studentId, months = 6) => {
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return {
    studentId: student.id,
    currentScores: student.currentScores,
    scoreHistory: student.scoreHistory,
    achievementFlags: student.achievementFlags,
  };
};

const getBatchScoreAnalytics = async (batchId) => {
  const students = await coachRepository.findStudentsByBatch(batchId);

  if (students.length === 0) {
    return {
      batchId,
      totalStudents: 0,
      averageScore: 0,
      scoreDistribution: {},
      topPerformers: [],
    };
  }

  const studentsWithScores = students.filter(
    (s) => s.currentScores && Object.keys(s.currentScores).length > 0
  );

  let totalScore = 0;
  const scoreDistribution = {
    excellent: 0,
    good: 0,
    average: 0,
    needsWork: 0,
  };

  studentsWithScores.forEach((student) => {
    const overallScore =
      Object.values(student.currentScores).reduce((sum, sport) => {
        return sum + (sport.overall || 0);
      }, 0) / Object.keys(student.currentScores).length;

    totalScore += overallScore;

    if (overallScore >= 8.5) scoreDistribution.excellent++;
    else if (overallScore >= 7.0) scoreDistribution.good++;
    else if (overallScore >= 5.0) scoreDistribution.average++;
    else scoreDistribution.needsWork++;
  });

  const averageScore =
    studentsWithScores.length > 0 ? totalScore / studentsWithScores.length : 0;

  return {
    batchId,
    totalStudents: students.length,
    studentsWithScores: studentsWithScores.length,
    averageScore: parseFloat(averageScore.toFixed(2)),
    scoreDistribution,
    topPerformers: studentsWithScores
      .sort((a, b) => {
        const aScore = Object.values(a.currentScores).reduce(
          (sum, sport) => sum + (sport.overall || 0),
          0
        );
        const bScore = Object.values(b.currentScores).reduce(
          (sum, sport) => sum + (sport.overall || 0),
          0
        );
        return bScore - aScore;
      })
      .slice(0, 5)
      .map((student) => ({
        studentId: student.id,
        name: student.name,
        scores: student.currentScores,
      })),
  };
};

const getCoachEffectivenessReport = async (coachId) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach not found");
  }

  const students = await coachRepository.getStudentsWithScores(coachId);

  let totalImprovement = 0;
  let studentsWithImprovement = 0;

  students.forEach((student) => {
    if (student.scoreHistory) {
      Object.values(student.scoreHistory).forEach((sport) => {
        if (sport.improvement > 0) {
          totalImprovement += sport.improvement;
          studentsWithImprovement++;
        }
      });
    }
  });

  const averageImprovement =
    studentsWithImprovement > 0
      ? totalImprovement / studentsWithImprovement
      : 0;

  return {
    coachId: coach.coachId,
    coachName: coach.name,
    totalStudents: students.length,
    averageImprovement: parseFloat(averageImprovement.toFixed(2)),
    studentsWithImprovement,
    effectivenessRating:
      averageImprovement > 1.0
        ? "High"
        : averageImprovement > 0.5
        ? "Medium"
        : "Low",
  };
};

const getStudentsWithScores = async (coachId, filters = {}) => {
  return await coachRepository.getStudentsWithScores(coachId, filters);
};

const bulkUpdateStudentScores = async (coachId, studentsScoreData) => {
  const results = [];
  const errors = [];

  for (const studentScoreData of studentsScoreData) {
    try {
      const result = await updateStudentScore(
        coachId,
        studentScoreData.studentId,
        studentScoreData.scoreData
      );
      results.push({
        studentId: studentScoreData.studentId,
        success: true,
        data: result,
      });
    } catch (error) {
      errors.push({
        studentId: studentScoreData.studentId,
        success: false,
        error: error.message,
      });
    }
  }

  return {
    successful: results,
    failed: errors,
    summary: {
      total: studentsScoreData.length,
      successful: results.length,
      failed: errors.length,
    },
  };
};

// Add progress tracking methods after existing analytics methods
const updateStudentQuarterlyProgress = async (
  coachId,
  studentId,
  year,
  quarter,
  progressData
) => {
  // Verify coach owns this student
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  // Validate and enhance progress data
  const validatedData = {
    ...progressData,
    updatedBy: coachId,
    lastUpdated: new Date().toISOString(),
  };

  return await coachRepository.updateCoachStudentQuarterlyProgress(
    student.id,
    year,
    quarter,
    validatedData
  );
};

const getStudentQuarterlyProgress = async (
  coachId,
  studentId,
  year = null,
  quarter = null
) => {
  // Verify coach owns this student
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return await coachRepository.getCoachStudentQuarterlyProgress(
    student.id,
    year,
    quarter
  );
};

const updateStudentCoachingPlan = async (coachId, studentId, planData) => {
  // Verify coach owns this student
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return await coachRepository.updateCoachingPlan(student.id, planData);
};

const updateStudentPerformanceMetrics = async (
  coachId,
  studentId,
  metricsData
) => {
  // Verify coach owns this student
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return await coachRepository.updatePerformanceMetrics(
    student.id,
    metricsData
  );
};

const getCoachProgressAnalytics = async (coachId, filters = {}) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  return await coachRepository.getCoachProgressAnalytics(coachId, filters);
};

const generateStudentProgressReport = async (
  coachId,
  studentId,
  year,
  quarter
) => {
  // Verify coach owns this student
  const student = await coachRepository.findCoachStudent(coachId, studentId);
  if (!student) {
    throw new Error("Student not found for this coach");
  }

  return await coachRepository.generateCoachStudentReport(
    student.id,
    year,
    quarter
  );
};

const getBatchProgressSummary = async (batchId, year, quarter) => {
  const batch = await coachRepository.findCoachBatchById(batchId);
  if (!batch) {
    throw new Error("Batch not found");
  }

  // Get all students in the batch
  const students = await coachRepository.findStudentsByBatch(batchId);

  const progressSummary = {
    batchInfo: {
      batchId: batch.batchId,
      batchName: batch.batchName,
      coachName: batch.coach?.name,
      totalStudents: students.length,
    },
    quarterProgress: {
      year,
      quarter,
      studentsWithProgress: 0,
      averageImprovement: 0,
      commonChallenges: [],
      topAchievers: [],
    },
    coachingEffectiveness: {
      sessionCompletionRate: 0,
      goalAchievementRate: 0,
      parentSatisfactionAverage: 0,
    },
  };

  let totalImprovement = 0;
  let studentsWithProgress = 0;
  const challengesCount = {};
  const achievementsData = [];

  // Analyze each student's progress
  for (const student of students) {
    try {
      const progress = await coachRepository.getCoachStudentQuarterlyProgress(
        student.id,
        year,
        quarter
      );

      if (progress.progress && Object.keys(progress.progress).length > 0) {
        studentsWithProgress++;

        Object.entries(progress.progress).forEach(([sport, data]) => {
          // Calculate improvements
          if (data.skills) {
            Object.values(data.skills).forEach((skill) => {
              if (skill.improvement) {
                totalImprovement += skill.improvement;
              }
            });
          }

          // Track challenges
          if (data.challenges) {
            data.challenges.forEach((challenge) => {
              challengesCount[challenge] =
                (challengesCount[challenge] || 0) + 1;
            });
          }

          // Track achievements
          if (data.personalizedGoals?.achieved?.length > 0) {
            achievementsData.push({
              studentName: progress.student.name,
              studentId: progress.student.id,
              achievements: data.personalizedGoals.achieved.length,
              overallImprovement: data.skills
                ? Object.values(data.skills).reduce(
                    (sum, skill) => sum + (skill.improvement || 0),
                    0
                  )
                : 0,
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error processing student ${student.id}:`, error.message);
    }
  }

  // Calculate summary metrics
  if (studentsWithProgress > 0) {
    progressSummary.quarterProgress.studentsWithProgress = studentsWithProgress;
    progressSummary.quarterProgress.averageImprovement =
      totalImprovement / studentsWithProgress;
  }

  // Find most common challenges
  progressSummary.quarterProgress.commonChallenges = Object.entries(
    challengesCount
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([challenge, count]) => ({ challenge, count }));

  // Find top achievers
  progressSummary.quarterProgress.topAchievers = achievementsData
    .sort((a, b) => b.overallImprovement - a.overallImprovement)
    .slice(0, 5);

  return progressSummary;
};

const getCoachEffectivenessReportNew = async (
  coachId,
  timeframe = "quarter"
) => {
  const coach = await coachRepository.findCoachProfileById(coachId);
  if (!coach) {
    throw new Error("Coach profile not found");
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentQuarter = `Q${Math.ceil((currentDate.getMonth() + 1) / 3)}`;

  const analytics = await coachRepository.getCoachProgressAnalytics(coachId, {
    year: currentYear,
    quarter: currentQuarter,
  });

  const students = await coachRepository.getStudentsWithScores(coachId);

  const report = {
    coachInfo: {
      coachId: coach.coachId,
      name: coach.name,
      experience: coach.experienceYears,
      totalStudents: students.length,
    },
    effectivenessMetrics: {
      studentImprovementRate:
        analytics.coachingEffectiveness.averageImprovement,
      goalAchievementRate: analytics.personalizedGoalsSuccess.successRate,
      consistentProgressStudents:
        analytics.coachingEffectiveness.consistentProgress,
      coachingTypeDistribution: analytics.coachingTypes,
    },
    skillSpecialization: {
      strongestAreas: [],
      improvementAreas: [],
      sessionEffectiveness: {},
    },
    studentSatisfaction: {
      averageRating: 0,
      parentFeedbackSummary: {
        positive: 0,
        neutral: 0,
        concerns: 0,
      },
    },
    recommendations: [],
  };

  // Analyze skill specialization
  Object.entries(analytics.averageProgress).forEach(([skill, data]) => {
    if (data.averageImprovement > 1.0) {
      report.skillSpecialization.strongestAreas.push({
        skill,
        improvement: data.averageImprovement,
        sessionEffectiveness: data.averageSessionEffectiveness,
      });
    } else if (data.averageImprovement < 0.5) {
      report.skillSpecialization.improvementAreas.push({
        skill,
        improvement: data.averageImprovement,
        sessionEffectiveness: data.averageSessionEffectiveness,
      });
    }
  });

  // Generate recommendations
  if (report.effectivenessMetrics.goalAchievementRate < 60) {
    report.recommendations.push(
      "Consider revising goal-setting approach to be more achievable"
    );
  }

  if (report.skillSpecialization.improvementAreas.length > 3) {
    report.recommendations.push("Focus training on identified weak areas");
  }

  if (
    analytics.coachingTypes["one-on-one"] > analytics.coachingTypes["group"]
  ) {
    report.recommendations.push(
      "Consider group coaching to improve efficiency"
    );
  }

  return report;
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

  // Add progress tracking exports
  updateStudentQuarterlyProgress,
  getStudentQuarterlyProgress,
  updateStudentCoachingPlan,
  updateStudentPerformanceMetrics,
  getCoachProgressAnalytics,
  generateStudentProgressReport,
  getBatchProgressSummary,
  getCoachEffectivenessReportNew,
};
