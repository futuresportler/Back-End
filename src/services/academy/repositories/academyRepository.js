const {
  AcademyProfile,
  Supplier,
  AcademyStudent,
  sequelize,
  AcademyBatch,
  AcademyProgram,
  AcademyCoach,
  AcademyFee,
  MonthlyStudentMetric,
} = require("../../../database");
const { Op } = require("sequelize");

// Remove the Sport and AcademySport imports as they don't exist

async function getAcademyProfileWithDetails(
  academyProfileId,
  {
    includeBatches = false,
    includePrograms = false,
    includeCoaches = false,
    includeStudents = false,
    includeFees = false,
  } = {}
) {
  const include = [];

  if (includeBatches) {
    include.push({ model: AcademyBatch, as: "AcademyBatches" });
  }
  if (includePrograms) {
    include.push({ model: AcademyProgram, as: "AcademyPrograms" });
  }
  if (includeCoaches) {
    include.push({ model: AcademyCoach, as: "AcademyCoaches" });
  }
  if (includeStudents) {
    include.push({ model: AcademyStudent, as: "AcademyStudents" });
  }
  if (includeFees) {
    include.push({ model: AcademyFee, as: "AcademyFees" });
  }

  // Always include supplier
  include.push({
    model: Supplier,
    as: "supplier",
    attributes: ["email", "mobile_number", "profilePicture", "location"],
  });

  return await AcademyProfile.findByPk(academyProfileId, {
    include,
  });
}

// Student-related repository methods
const createStudent = async (studentData, transaction = null) => {
  // Initialize score fields for new students
  const studentWithScores = {
    ...studentData,
    currentScores: studentData.currentScores || {},
    achievementBadges: studentData.achievementBadges || [],
    scoreTrends: studentData.scoreTrends || {},
  };

  return await AcademyStudent.create(studentWithScores, { transaction });
};

const updateStudent = async (studentId, updateData, transaction = null) => {
  const student = await AcademyStudent.findByPk(studentId, { transaction });
  if (!student) return null;

  // Merge score data if provided
  if (updateData.currentScores) {
    updateData.currentScores = {
      ...student.currentScores,
      ...updateData.currentScores,
    };
  }

  if (updateData.scoreTrends) {
    updateData.scoreTrends = {
      ...student.scoreTrends,
      ...updateData.scoreTrends,
    };
  }

  return await student.update(updateData, { transaction });
};

// Add method to get students with score data
const getStudentsWithScoreAnalytics = async (academyId, filters = {}) => {
  const { includeScoreTrends = false, sport = null } = filters;

  const where = { academyId };

  if (sport) {
    where.sport = sport;
  }

  const attributes = [
    "studentId",
    "name",
    "sport",
    "currentScores",
    "achievementBadges",
    "status",
  ];

  if (includeScoreTrends) {
    attributes.push("scoreTrends");
  }

  return await AcademyStudent.findAll({
    where,
    attributes,
    include: [
      {
        model: AcademyBatch,
        as: "batch",
        attributes: ["batchId", "batchName"],
      },
      {
        model: AcademyProgram,
        as: "program",
        attributes: ["programId", "programName"],
      },
    ],
    order: [
      [
        sequelize.literal(`("currentScores"->>'overall')::float`),
        "DESC NULLS LAST",
      ],
    ],
  });
};

// Add method to update student scores
const updateStudentScores = async (studentId, scoreData, monthId) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await AcademyStudent.findByPk(studentId, { transaction });
    if (!student) {
      throw new Error("Student not found");
    }

    // Update current scores
    const updatedScores = {
      ...student.currentScores,
      ...scoreData.currentScores,
    };

    // Update score trends
    const updatedTrends = {
      ...student.scoreTrends,
      ...scoreData.scoreTrends,
    };

    await student.update(
      {
        currentScores: updatedScores,
        scoreTrends: updatedTrends,
        achievementBadges:
          scoreData.achievementBadges || student.achievementBadges,
      },
      { transaction }
    );

    // Update monthly metrics
    await updateMonthlyStudentScoreMetric(
      studentId,
      scoreData,
      monthId,
      transaction
    );

    await transaction.commit();
    return student;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Helper method to update monthly score metrics
const updateMonthlyStudentScoreMetric = async (
  studentId,
  scoreData,
  monthId,
  transaction
) => {
  const [metric, created] = await MonthlyStudentMetric.findOrCreate({
    where: { studentId, monthId },
    defaults: {
      averageScores: scoreData.averageScores || {},
      scoreImprovements: scoreData.scoreImprovements || {},
      achievementsEarned: scoreData.achievementsEarned || [],
    },
    transaction,
  });

  if (!created && scoreData.averageScores) {
    await metric.update(
      {
        averageScores: scoreData.averageScores,
        scoreImprovements:
          scoreData.scoreImprovements || metric.scoreImprovements,
        achievementsEarned: [
          ...(metric.achievementsEarned || []),
          ...(scoreData.achievementsEarned || []),
        ],
      },
      { transaction }
    );
  }

  return metric;
};

const getStudentById = async (studentId) => {
  return await AcademyStudent.findByPk(studentId, {
    include: [
      {
        model: AcademyBatch,
        as: "batch",
        attributes: ["batchId", "batchName"],
      },
      {
        model: AcademyProgram,
        as: "program",
        attributes: ["programId", "programName"],
      },
    ],
  });
};

const getStudentsByAcademy = async (academyId, filters = {}) => {
  const {
    name,
    sport,
    status,
    batchId,
    programId,
    page = 1,
    limit = 20,
  } = filters;

  const where = { academyId };

  if (name) {
    where.name = { [Op.iLike]: `%${name}%` };
  }

  if (sport) {
    where.sport = sport;
  }

  if (status) {
    where.status = status;
  }

  if (batchId) {
    where.batchId = batchId;
  }

  if (programId) {
    where.programId = programId;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await AcademyStudent.findAndCountAll({
    where,
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
    include: [
      {
        model: AcademyBatch,
        as: "batch",
        attributes: ["batchId", "batchName"],
      },
      {
        model: AcademyProgram,
        as: "program",
        attributes: ["programId", "programName"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return {
    students: rows,
    pagination: {
      total: count,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  };
};

const getStudentsByProgram = async (programId) => {
  return await AcademyStudent.findAll({
    where: { programId },
  });
};

const deleteStudent = async (studentId) => {
  const student = await AcademyStudent.findByPk(studentId);
  if (!student) return null;
  await student.destroy();
  return student;
};

const findAcademyProfileById = async (academyProfileId) => {
  return await AcademyProfile.findByPk(academyProfileId, {
    attributes: [
      "academyId",
      "name",
      "description",
      "sports",
      "facilities",
      "images",
      "timings",
      "contactInfo",
      "rating",
      "reviews",
      "totalStudents",
      "experienceYears",
      "certifications",
      "achievements",
      "feeStructure",
      "priority", // Priority field for promotions
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

const findAllAcademyProfiles = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "priority", // Default to priority sorting
    city,
    state,
    sport,
    minRating,
    maxFee,
    latitude,
    longitude,
    radius = 50,
    searchTerm,
  } = filters;

  const offset = (page - 1) * limit;
  let whereClause = {};
  let supplierWhereClause = {};

  // Build where clauses
  if (city) {
    supplierWhereClause["city"] = { [Op.iLike]: `%${city}%` };
  }

  if (state) {
    supplierWhereClause["state"] = { [Op.iLike]: `%${state}%` };
  }

  if (sport) {
    whereClause["sports"] = {
      [Op.contains]: [sport],
    };
  }

  if (minRating) {
    whereClause["rating"] = { [Op.gte]: minRating };
  }

  if (maxFee) {
    whereClause["feeStructure"] = {
      [Op.and]: [
        sequelize.where(
          sequelize.cast(sequelize.json("feeStructure.monthly"), "integer"),
          { [Op.lte]: maxFee }
        ),
      ],
    };
  }

  if (searchTerm) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${searchTerm}%` } },
      { description: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  // Build order clause with priority first
  const order = [];

  // Always prioritize promoted content first
  order.push([sequelize.json("priority.value"), "DESC"]);

  if (sortBy === "priority") {
    // Priority is already added above
  } else if (sortBy === "rating") {
    order.push(["rating", "DESC"]);
  } else if (sortBy === "name") {
    order.push(["name", "ASC"]);
  } else if (sortBy === "distance" && latitude && longitude) {
    order.push([
      sequelize.literal(`ST_Distance(
        "supplier"."location", 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )`),
      "ASC",
    ]);
  }

  // Always add a secondary sort by id for consistent results
  order.push(["academyId", "ASC"]);

  const include = [
    {
      model: Supplier,
      as: "supplier",
      where: supplierWhereClause,
      attributes: ["name", "email", "city", "state", "location"],
    },
  ];

  // Add distance filter if coordinates provided
  if (latitude && longitude && radius) {
    include[0].where = {
      ...supplierWhereClause,
      [Op.and]: [
        sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn(
              "ST_SetSRID",
              sequelize.fn("ST_MakePoint", longitude, latitude),
              4326
            ),
            radius * 1000 // Convert km to meters
          ),
          true
        ),
      ],
    };
  }

  const { count, rows } = await AcademyProfile.findAndCountAll({
    where: whereClause,
    include,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
  });

  return {
    academies: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  };
};

const findAcademiesNearby = async (latitude, longitude, radius) => {
  return await AcademyProfile.findAll({
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
        attributes: ["name", "email", "city", "state", "location"],
      },
    ],
    order: [
      [sequelize.json("priority.value"), "DESC"], // Priority first
      ["rating", "DESC"],
      ["academyId", "ASC"],
    ],
  });
};

const createAcademyProfile = async (profileData) => {
  return await AcademyProfile.create(profileData);
};

const updateAcademyProfile = async (academyId, updateData) => {
  const academy = await AcademyProfile.findByPk(academyId);
  if (!academy) {
    throw new Error("Academy profile not found");
  }

  return await academy.update(updateData);
};

const deleteAcademyProfile = async (academyId) => {
  const academy = await AcademyProfile.findByPk(academyId);
  if (!academy) {
    throw new Error("Academy profile not found");
  }

  await academy.destroy();
  return { message: "Academy profile deleted successfully" };
};

const findAcademiesBySupplierId = async (supplierId) => {
  return await AcademyProfile.findAll({
    where: { supplierId },
    attributes: [
      "academyId",
      "name",
      "description",
      "sports",
      "facilities",
      "images",
      "timings",
      "contactInfo",
      "rating",
      "reviews",
      "totalStudents",
      "experienceYears",
      "certifications",
      "achievements",
      "feeStructure",
      "priority", // Include priority field
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["supplierId", "name", "email", "city", "state"],
      },
    ],
    order: [
      [sequelize.json("priority.value"), "DESC"], // Prioritize promoted academies
      ["createdAt", "DESC"],
    ],
  });
};

const findAcademiesBySport = async (sport, filters = {}) => {
  const { limit = 10, latitude, longitude } = filters;

  const order = [
    [sequelize.json("priority.value"), "DESC"], // Always prioritize promoted content
    ["rating", "DESC"],
    ["academyId", "ASC"],
  ];

  if (latitude && longitude) {
    order.splice(2, 0, [
      sequelize.literal(`ST_Distance(
        "supplier"."location", 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )`),
      "ASC",
    ]);
  }

  return await AcademyProfile.findAll({
    where: {
      sports: { [Op.contains]: [sport] },
    },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "city", "state", "location"],
      },
    ],
    order,
    limit: parseInt(limit),
  });
};

const getTopRatedAcademies = async (limit = 10) => {
  return await AcademyProfile.findAll({
    order: [
      [sequelize.json("priority.value"), "DESC"], // Priority first
      ["rating", "DESC"],
      ["reviews", "DESC"],
      ["academyId", "ASC"],
    ],
    limit: parseInt(limit),
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "city", "state"],
      },
    ],
  });
};

const getAcademyAnalytics = async (academyId) => {
  const academy = await findAcademyProfileById(academyId);
  if (!academy) {
    throw new Error("Academy not found");
  }

  return {
    academy: academy.toJSON(),
    promotionStatus: {
      isPromoted: academy.priority?.value > 0,
      plan: academy.priority?.plan || "none",
      expiresAt: academy.priority?.expiresAt,
    },
  };
};

// Add quarterly progress tracking methods
const updateQuarterlyProgress = async (
  studentId,
  year,
  quarter,
  progressData
) => {
  const student = await AcademyStudent.findByPk(studentId);
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

const getQuarterlyProgress = async (studentId, year = null, quarter = null) => {
  const student = await AcademyStudent.findByPk(studentId, {
    attributes: [
      "studentId",
      "name",
      "progressTracking",
      "quarterlyReports",
      "progressMilestones",
    ],
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (year && quarter) {
    return student.progressTracking?.[year]?.[quarter] || {};
  }

  if (year) {
    return student.progressTracking?.[year] || {};
  }

  return student.progressTracking || {};
};

const generateQuarterlyReport = async (studentId, year, quarter) => {
  const student = await AcademyStudent.findByPk(studentId, {
    include: [
      {
        model: AcademyBatch,
        as: "batch",
        attributes: ["batchId", "batchName", "sport"],
      },
      {
        model: AcademyProgram,
        as: "program",
        attributes: ["programId", "programName", "sport"],
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

  // Generate comprehensive report
  const report = {
    reportId: require("uuid").v4(),
    quarter: `${year}-${quarter}`,
    generatedDate: new Date().toISOString(),
    studentInfo: {
      studentId: student.studentId,
      name: student.name,
      batch: student.batch?.batchName,
      program: student.program?.programName,
    },
    quarterData: quarterProgress,
    summary: await calculateQuarterlySummary(quarterProgress),
    recommendations: await generateRecommendations(quarterProgress),
    milestones: student.progressMilestones || {},
    status: "generated",
  };

  // Add report to student's quarterly reports
  const currentReports = student.quarterlyReports || [];
  currentReports.push(report);

  await student.update({
    quarterlyReports: currentReports,
  });

  return report;
};

const calculateQuarterlySummary = async (quarterProgress) => {
  const sports = Object.keys(quarterProgress);
  let totalImprovement = 0;
  let strongestSport = null;
  let maxImprovement = 0;
  const areasOfFocus = [];

  sports.forEach((sport) => {
    const sportData = quarterProgress[sport];
    if (sportData.overallScore) {
      const improvement = sportData.overallScore.improvement || 0;
      totalImprovement += improvement;

      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        strongestSport = sport;
      }

      // Identify areas needing focus (skills with low improvement)
      if (sportData.skills) {
        Object.entries(sportData.skills).forEach(([skill, data]) => {
          if (data.improvement < 0.5) {
            areasOfFocus.push(skill);
          }
        });
      }
    }
  });

  return {
    overallImprovement: totalImprovement / sports.length,
    strongestSport,
    areasOfFocus: [...new Set(areasOfFocus)],
    sportsCount: sports.length,
  };
};

const generateRecommendations = async (quarterProgress) => {
  const recommendations = [];

  Object.entries(quarterProgress).forEach(([sport, data]) => {
    if (data.skills) {
      Object.entries(data.skills).forEach(([skill, skillData]) => {
        if (skillData.current < skillData.target) {
          const gap = skillData.target - skillData.current;
          if (gap > 1.0) {
            recommendations.push(
              `Focus on improving ${skill} in ${sport} - current gap: ${gap.toFixed(
                1
              )} points`
            );
          }
        }
      });
    }

    if (data.challenges && data.challenges.length > 0) {
      recommendations.push(
        `Address challenges in ${sport}: ${data.challenges.join(", ")}`
      );
    }
  });

  return recommendations;
};

const updateProgressMilestones = async (
  studentId,
  sport,
  level,
  achieved = true
) => {
  const student = await AcademyStudent.findByPk(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  const currentMilestones = student.progressMilestones || {};

  if (!currentMilestones[sport]) {
    currentMilestones[sport] = {};
  }

  currentMilestones[sport][level] = {
    achieved,
    date: achieved ? new Date().toISOString() : null,
    score: achieved ? student.currentScores?.[sport]?.overall || 0 : null,
  };

  // Update level progression if milestone achieved
  if (achieved && currentMilestones.levelProgression) {
    const levels = ["beginner", "intermediate", "advanced", "expert"];
    const currentLevelIndex = levels.indexOf(level);

    if (currentLevelIndex < levels.length - 1) {
      currentMilestones.levelProgression = {
        ...currentMilestones.levelProgression,
        currentLevel: level,
        nextLevel: levels[currentLevelIndex + 1],
      };
    }
  }

  return await student.update({
    progressMilestones: currentMilestones,
  });
};

const getProgressAnalytics = async (academyId, filters = {}) => {
  const { sport, timeframe = "quarter", year, quarter } = filters;

  let whereClause = { academyId };
  if (sport) {
    whereClause.sport = sport;
  }

  const students = await AcademyStudent.findAll({
    where: whereClause,
    attributes: [
      "studentId",
      "name",
      "sport",
      "progressTracking",
      "progressMilestones",
      "currentScores",
      "scoreTrends",
    ],
  });

  const analytics = {
    totalStudents: students.length,
    sportDistribution: {},
    averageProgress: {},
    milestoneAchievements: {},
    trendAnalysis: {},
  };

  students.forEach((student) => {
    const studentSport = student.sport;

    // Sport distribution
    analytics.sportDistribution[studentSport] =
      (analytics.sportDistribution[studentSport] || 0) + 1;

    // Progress analysis
    if (year && quarter && student.progressTracking?.[year]?.[quarter]) {
      const quarterData = student.progressTracking[year][quarter];

      Object.entries(quarterData).forEach(([sport, data]) => {
        if (!analytics.averageProgress[sport]) {
          analytics.averageProgress[sport] = {
            totalImprovement: 0,
            studentCount: 0,
            skillBreakdown: {},
          };
        }

        if (data.overallScore?.improvement) {
          analytics.averageProgress[sport].totalImprovement +=
            data.overallScore.improvement;
          analytics.averageProgress[sport].studentCount += 1;
        }

        // Skill breakdown
        if (data.skills) {
          Object.entries(data.skills).forEach(([skill, skillData]) => {
            if (!analytics.averageProgress[sport].skillBreakdown[skill]) {
              analytics.averageProgress[sport].skillBreakdown[skill] = {
                totalImprovement: 0,
                count: 0,
              };
            }

            if (skillData.improvement) {
              analytics.averageProgress[sport].skillBreakdown[
                skill
              ].totalImprovement += skillData.improvement;
              analytics.averageProgress[sport].skillBreakdown[skill].count += 1;
            }
          });
        }
      });
    }

    // Milestone analysis
    if (student.progressMilestones) {
      Object.entries(student.progressMilestones).forEach(
        ([sport, milestones]) => {
          if (!analytics.milestoneAchievements[sport]) {
            analytics.milestoneAchievements[sport] = {
              beginner: 0,
              intermediate: 0,
              advanced: 0,
              expert: 0,
            };
          }

          Object.entries(milestones).forEach(([level, data]) => {
            if (
              data.achieved &&
              analytics.milestoneAchievements[sport][level] !== undefined
            ) {
              analytics.milestoneAchievements[sport][level] += 1;
            }
          });
        }
      );
    }
  });

  // Calculate averages
  Object.keys(analytics.averageProgress).forEach((sport) => {
    const sportData = analytics.averageProgress[sport];
    if (sportData.studentCount > 0) {
      sportData.averageImprovement =
        sportData.totalImprovement / sportData.studentCount;
    }

    Object.keys(sportData.skillBreakdown).forEach((skill) => {
      const skillData = sportData.skillBreakdown[skill];
      if (skillData.count > 0) {
        skillData.averageImprovement =
          skillData.totalImprovement / skillData.count;
      }
    });
  });

  return analytics;
};

module.exports = {
  createAcademyProfile,
  findAcademyProfileById,
  getAcademyProfileWithDetails,
  findAcademiesBySupplierId,
  updateAcademyProfile,
  deleteAcademyProfile,
  findAcademiesNearby,
  findAllAcademyProfiles,
  findAcademiesBySport,
  getTopRatedAcademies,
  getAcademyAnalytics,
  // Student-related exports
  createStudent,
  updateStudent,
  getStudentById,
  getStudentsByAcademy,
  getStudentsByProgram,
  deleteStudent,
  getStudentsWithScoreAnalytics,
  updateStudentScores,
  updateMonthlyStudentScoreMetric,
  // Quarterly progress tracking exports
  updateQuarterlyProgress,
  getQuarterlyProgress,
  generateQuarterlyReport,
  updateProgressMilestones,
  getProgressAnalytics,
  calculateQuarterlySummary,
  generateRecommendations,
};
