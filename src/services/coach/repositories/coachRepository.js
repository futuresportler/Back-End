const {
  CoachProfile,
  CoachBatch,
  CoachStudent,
  CoachPayment,
  User,
  Supplier,
  sequelize,
} = require("../../../database");

const findCoachProfileById = async (coachProfileId) => {
  return await CoachProfile.findByPk(coachProfileId, {
    attributes: [
      "coachId",
      "name",
      "sports",
      "experienceYears",
      "certifications",
      "achievements",
      "hourlyRate",
      "description",
      "images",
      "rating",
      "reviews",
      "availability",
      "specializations",
      "languages",
      "ageGroups",
      "sessionTypes",
      "priority", // Already present - good!
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
  });
};

const findCoachBySupplierId = async (supplierId) => {
  return await CoachProfile.findOne({
    where: { supplierId },
    attributes: [
      "coachId",
      "name",
      "sports",
      "experienceYears",
      "certifications",
      "achievements",
      "hourlyRate",
      "description",
      "images",
      "rating",
      "reviews",
      "availability",
      "specializations",
      "languages",
      "ageGroups",
      "sessionTypes",
      "priority",
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
  });
};

// Add new method to get students with scores
const getStudentsWithScores = async (coachId, filters = {}) => {
  const { includeScoreHistory = false, monthId = null } = filters;

  const include = [
    {
      model: User,
      as: "student",
      attributes: ["userId", "first_name", "last_name", "email", "mobile"],
    },
  ];

  if (includeScoreHistory && monthId) {
    include.push({
      model: MonthlyStudentProgress,
      as: "monthlyProgress",
      where: { monthId },
      required: false,
    });
  }

  return await CoachStudent.findAll({
    where: { coachId },
    attributes: [
      "id",
      "userId",
      "coachId",
      "currentScores",
      "achievementFlags",
      "scoreHistory",
      "progressTracking",
      "performanceMetrics",
      "coachingPlan",
      "createdAt",
    ],
    include,
    order: [["createdAt", "DESC"]],
  });
};

// Add method to update student scores
const updateStudentScores = async (coachId, studentId, scoreData) => {
  const coachStudent = await CoachStudent.findOne({
    where: { coachId, userId: studentId },
  });

  if (!coachStudent) {
    throw new Error("Student not found in coach's roster");
  }

  const updatedScores = {
    ...coachStudent.currentScores,
    ...scoreData.currentScores,
  };

  const updatedHistory = {
    ...coachStudent.scoreHistory,
    ...scoreData.scoreHistory,
  };

  return await coachStudent.update({
    currentScores: updatedScores,
    scoreHistory: updatedHistory,
    achievementFlags:
      scoreData.achievementFlags || coachStudent.achievementFlags,
  });
};

const createCoachProfile = async (profileData) => {
  return await CoachProfile.create(profileData);
};

const updateCoachProfile = async (coachProfileId, updateData) => {
  const profile = await CoachProfile.findByPk(coachProfileId);
  if (!profile) return null;
  return await profile.update(updateData);
};

const deleteCoachProfile = async (coachProfileId) => {
  const profile = await CoachProfile.findByPk(coachProfileId);
  if (!profile) return null;
  await profile.destroy();
  return profile;
};

const findCoachesNearby = async (latitude, longitude, radius) => {
  return await CoachProfile.findAll({
    attributes: [
      "coachId",
      "name",
      "sports",
      "experienceYears",
      "certifications",
      "achievements",
      "hourlyRate",
      "description",
      "images",
      "rating",
      "reviews",
      "availability",
      "specializations",
      "languages",
      "ageGroups",
      "sessionTypes",
      "priority", // Add priority field
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn(
              "ST_SetSRID",
              sequelize.fn("ST_MakePoint", longitude, latitude),
              4326
            ),
            radius
          ),
          true
        ),
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
    order: [
      [sequelize.json("priority.value"), "DESC"], // Priority first
      ["rating", "DESC"],
      ["coachId", "ASC"],
    ],
  });
};

// Batch related functions
const findCoachBatchById = async (batchId) => {
  return await CoachBatch.findByPk(batchId, {
    include: [
      {
        model: CoachProfile,
        as: "coach",
        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: [
              "email",
              "mobile_number",
              "profilePicture",
              "location",
            ],
          },
        ],
      },
    ],
  });
};

const findCoachBatches = async (coachId) => {
  return await CoachBatch.findAll({
    where: { coachId },
    order: [["createdAt", "DESC"]],
  });
};

const createCoachBatch = async (batchData) => {
  return await CoachBatch.create(batchData);
};

const updateCoachBatch = async (batchId, updateData) => {
  const batch = await CoachBatch.findByPk(batchId);
  if (!batch) return null;
  return await batch.update(updateData);
};

const deleteCoachBatch = async (batchId) => {
  const batch = await CoachBatch.findByPk(batchId);
  if (!batch) return null;
  await batch.destroy();
  return batch;
};

// Student related functions
const findStudentsByBatch = async (batchId) => {
  return await CoachStudent.findAll({
    where: { batchId },
    include: [
      {
        model: User,
        as: "student",
        attributes: [
          "userId",
          "first_name",
          "last_name",
          "email",
          "profile_picture",
        ],
      },
    ],
  });
};

const addStudentToBatch = async (
  batchId,
  userId,
  coachId,
  studentData = {}
) => {
  // First, check if the batch exists and has space
  const batch = await CoachBatch.findByPk(batchId);
  if (!batch) throw new Error("Batch not found");

  if (batch.currentStudents >= batch.maxStudents) {
    throw new Error("Batch is full");
  }

  // Check if student is already in this coach's roster
  let student = await CoachStudent.findOne({
    where: { coachId, userId },
  });

  if (student) {
    // Update existing student record
    student = await student.update({
      batchId,
      ...studentData,
    });
  } else {
    // Create new student record
    student = await CoachStudent.create({
      coachId,
      userId,
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
  const student = await CoachStudent.findOne({
    where: { batchId, userId },
  });

  if (!student) throw new Error("Student not found in this batch");

  // Update student record to remove batch association
  await student.update({ batchId: null });

  // Update batch current students count
  const batch = await CoachBatch.findByPk(batchId);
  if (batch) {
    await batch.update({
      currentStudents: sequelize.literal("currentStudents - 1"),
    });
  }

  return student;
};

// Payment related functions
const createBatchPayment = async (paymentData) => {
  return await CoachPayment.create(paymentData);
};

const findBatchPayments = async (batchId) => {
  return await CoachPayment.findAll({
    where: { batchId },
    include: [
      {
        model: User,
        attributes: ["userId", "first_name", "last_name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// Update or add these methods to handle students without userId
const findCoachStudent = async (coachId, userId) => {
  if (!userId) return null;

  return await CoachStudent.findOne({
    where: { coachId, userId },
  });
};

const createCoachStudent = async (studentData) => {
  return await CoachStudent.create(studentData);
};

const updateCoachStudent = async (studentId, updateData) => {
  const student = await CoachStudent.findByPk(studentId);
  if (!student) return null;
  return await student.update(updateData);
};

// Add quarterly progress tracking for coach students
const updateCoachStudentQuarterlyProgress = async (
  studentId,
  year,
  quarter,
  progressData
) => {
  const student = await CoachStudent.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const currentProgress = student.progressTracking || {};

  if (!currentProgress[year]) {
    currentProgress[year] = {};
  }

  currentProgress[year][quarter] = {
    ...currentProgress[year][quarter],
    ...progressData,
    lastUpdated: new Date().toISOString(),
  };

  return await student.update({
    progressTracking: currentProgress,
  });
};

const getCoachStudentQuarterlyProgress = async (
  studentId,
  year = null,
  quarter = null
) => {
  const student = await CoachStudent.findByPk(studentId, {
    attributes: [
      "id",
      "name",
      "progressTracking",
      "coachingPlan",
      "performanceMetrics",
    ],
    include: [
      {
        model: User,
        as: "student",
        attributes: ["userId", "first_name", "last_name"],
      },
    ],
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (year && quarter) {
    return {
      student: {
        id: student.id,
        name:
          student.name ||
          `${student.student?.first_name} ${student.student?.last_name}`,
        userId: student.student?.userId,
      },
      progress: student.progressTracking?.[year]?.[quarter] || {},
      coachingPlan: student.coachingPlan || {},
      performanceMetrics: student.performanceMetrics || {},
    };
  }

  if (year) {
    return {
      student: {
        id: student.id,
        name:
          student.name ||
          `${student.student?.first_name} ${student.student?.last_name}`,
        userId: student.student?.userId,
      },
      progress: student.progressTracking?.[year] || {},
      coachingPlan: student.coachingPlan || {},
      performanceMetrics: student.performanceMetrics || {},
    };
  }

  return {
    student: {
      id: student.id,
      name:
        student.name ||
        `${student.student?.first_name} ${student.student?.last_name}`,
      userId: student.student?.userId,
    },
    progress: student.progressTracking || {},
    coachingPlan: student.coachingPlan || {},
    performanceMetrics: student.performanceMetrics || {},
  };
};

const updateCoachingPlan = async (studentId, planData) => {
  const student = await CoachStudent.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const currentPlan = student.coachingPlan || {};

  const updatedPlan = {
    ...currentPlan,
    ...planData,
    lastUpdated: new Date().toISOString(),
  };

  return await student.update({
    coachingPlan: updatedPlan,
  });
};

const updatePerformanceMetrics = async (studentId, metricsData) => {
  const student = await CoachStudent.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const currentMetrics = student.performanceMetrics || {};

  const updatedMetrics = {
    ...currentMetrics,
    ...metricsData,
    lastUpdated: new Date().toISOString(),
  };

  return await student.update({
    performanceMetrics: updatedMetrics,
  });
};

const getCoachProgressAnalytics = async (coachId, filters = {}) => {
  const { timeframe = "quarter", year, quarter, sport } = filters;

  let whereClause = { coachId };

  const students = await CoachStudent.findAll({
    where: whereClause,
    attributes: [
      "id",
      "name",
      "sport",
      "progressTracking",
      "currentScores",
      "scoreHistory",
      "coachingPlan",
      "performanceMetrics",
    ],
    include: [
      {
        model: User,
        as: "student",
        attributes: ["userId", "first_name", "last_name"],
      },
    ],
  });

  const analytics = {
    totalStudents: students.length,
    coachingTypes: {
      "one-on-one": 0,
      group: 0,
      batch: 0,
    },
    averageProgress: {},
    coachingEffectiveness: {
      studentsImproved: 0,
      averageImprovement: 0,
      consistentProgress: 0,
    },
    personalizedGoalsSuccess: {
      totalGoals: 0,
      achievedGoals: 0,
      inProgressGoals: 0,
    },
  };

  students.forEach((student) => {
    // Analyze coaching effectiveness
    if (year && quarter && student.progressTracking?.[year]?.[quarter]) {
      const quarterData = student.progressTracking[year][quarter];

      Object.entries(quarterData).forEach(([sport, data]) => {
        if (data.coachingType) {
          analytics.coachingTypes[data.coachingType] =
            (analytics.coachingTypes[data.coachingType] || 0) + 1;
        }

        if (data.skills) {
          Object.entries(data.skills).forEach(([skill, skillData]) => {
            if (!analytics.averageProgress[skill]) {
              analytics.averageProgress[skill] = {
                totalImprovement: 0,
                studentCount: 0,
                sessionEffectiveness: 0,
              };
            }

            if (skillData.current > skillData.initial) {
              analytics.averageProgress[skill].totalImprovement +=
                skillData.current - skillData.initial;
              analytics.averageProgress[skill].studentCount += 1;
              analytics.coachingEffectiveness.studentsImproved += 1;
            }

            if (skillData.sessions) {
              const improvement = skillData.current - skillData.initial;
              const effectivenessRate = improvement / skillData.sessions;
              analytics.averageProgress[skill].sessionEffectiveness +=
                effectivenessRate;
            }
          });
        }

        // Analyze personalized goals
        if (data.personalizedGoals) {
          analytics.personalizedGoalsSuccess.totalGoals +=
            (data.personalizedGoals.achieved?.length || 0) +
            (data.personalizedGoals.inProgress?.length || 0);
          analytics.personalizedGoalsSuccess.achievedGoals +=
            data.personalizedGoals.achieved?.length || 0;
          analytics.personalizedGoalsSuccess.inProgressGoals +=
            data.personalizedGoals.inProgress?.length || 0;
        }
      });
    }

    // Performance metrics analysis
    if (student.performanceMetrics?.sessionsAnalytics) {
      const sessionData = student.performanceMetrics.sessionsAnalytics;
      if (sessionData.improvementVelocity > 0.2) {
        analytics.coachingEffectiveness.consistentProgress += 1;
      }
    }
  });

  // Calculate averages and percentages
  analytics.coachingEffectiveness.averageImprovement =
    analytics.coachingEffectiveness.studentsImproved > 0
      ? analytics.coachingEffectiveness.studentsImproved / students.length
      : 0;

  analytics.personalizedGoalsSuccess.successRate =
    analytics.personalizedGoalsSuccess.totalGoals > 0
      ? (analytics.personalizedGoalsSuccess.achievedGoals /
          analytics.personalizedGoalsSuccess.totalGoals) *
        100
      : 0;

  Object.keys(analytics.averageProgress).forEach((skill) => {
    const skillData = analytics.averageProgress[skill];
    if (skillData.studentCount > 0) {
      skillData.averageImprovement =
        skillData.totalImprovement / skillData.studentCount;
      skillData.averageSessionEffectiveness =
        skillData.sessionEffectiveness / skillData.studentCount;
    }
  });

  return analytics;
};

const generateCoachStudentReport = async (studentId, year, quarter) => {
  const student = await CoachStudent.findByPk(studentId, {
    include: [
      {
        model: User,
        as: "student",
        attributes: ["userId", "first_name", "last_name", "email"],
      },
      {
        model: CoachProfile,
        as: "coach",
        attributes: ["coachId", "name"],
      },
    ],
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const quarterProgress = student.progressTracking?.[year]?.[quarter];
  if (!quarterProgress) {
    throw new Error("No progress data found for specified quarter");
  }

  const report = {
    reportId: require("uuid").v4(),
    quarter: `${year}-${quarter}`,
    generatedDate: new Date().toISOString(),
    studentInfo: {
      studentId: student.id,
      name:
        student.name ||
        `${student.student?.first_name} ${student.student?.last_name}`,
      userId: student.student?.userId,
      email: student.student?.email,
    },
    coachInfo: {
      coachId: student.coach?.coachId,
      name: student.coach?.name,
    },
    quarterData: quarterProgress,
    coachingPlan: student.coachingPlan || {},
    performanceMetrics: student.performanceMetrics || {},
    recommendations: await generateCoachRecommendations(
      quarterProgress,
      student.performanceMetrics
    ),
    status: "generated",
  };

  return report;
};

const generateCoachRecommendations = async (
  quarterProgress,
  performanceMetrics
) => {
  const recommendations = [];

  Object.entries(quarterProgress).forEach(([sport, data]) => {
    if (data.personalizedGoals?.inProgress?.length > 0) {
      recommendations.push(
        `Continue focusing on: ${data.personalizedGoals.inProgress.join(", ")}`
      );
    }

    if (data.challenges?.length > 0) {
      recommendations.push(
        `Address ongoing challenges: ${data.challenges.join(", ")}`
      );
    }

    if (data.skills) {
      Object.entries(data.skills).forEach(([skill, skillData]) => {
        const progressRate =
          skillData.sessions > 0
            ? (skillData.current - skillData.initial) / skillData.sessions
            : 0;

        if (progressRate < 0.1) {
          recommendations.push(
            `Consider different approach for ${skill} - slow progress detected`
          );
        }
      });
    }
  });

  if (performanceMetrics?.parentSatisfaction?.concerns?.length > 0) {
    recommendations.push(
      `Address parent concerns: ${performanceMetrics.parentSatisfaction.concerns.join(
        ", "
      )}`
    );
  }

  return recommendations;
};

module.exports = {
  findCoachProfileById,
  findCoachBySupplierId,
  createCoachProfile,
  updateCoachProfile,
  deleteCoachProfile,
  findCoachesNearby,

  // Add the new batch functions
  findCoachBatchById,
  findCoachBatches,
  createCoachBatch,
  updateCoachBatch,
  deleteCoachBatch,

  // Add the new student functions
  findStudentsByBatch,
  addStudentToBatch,
  removeStudentFromBatch,

  // Add the new payment functions
  createBatchPayment,
  findBatchPayments,
  findCoachStudent,
  createCoachStudent,
  updateCoachStudent,

  // Add new methods for scores
  getStudentsWithScores,
  updateStudentScores,
  updateCoachStudentQuarterlyProgress,
  getCoachStudentQuarterlyProgress,
  updateCoachingPlan,
  updatePerformanceMetrics,
  getCoachProgressAnalytics,
  generateCoachStudentReport,
  generateCoachRecommendations,
};
