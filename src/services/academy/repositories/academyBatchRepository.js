const {
  AcademyBatch,
  AcademyStudent,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

const createBatch = async (batchData) => {
  return await AcademyBatch.create(batchData);
};

const getBatchById = async (batchId) => {
  return await AcademyBatch.findByPk(batchId);
};

const getBatchesByAcademy = async (academyId, filters = {}) => {
  const where = { academyId };

  // Apply filters
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.sport) {
    where.sport = filters.sport;
  }

  if (filters.ageGroup) {
    where.ageGroup = filters.ageGroup;
  }

  return await AcademyBatch.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
};

const updateBatch = async (batchId, updateData) => {
  const batch = await AcademyBatch.findByPk(batchId);
  if (!batch) return null;
  return await batch.update(updateData);
};

const deleteBatch = async (batchId) => {
  const batch = await AcademyBatch.findByPk(batchId);
  if (!batch) return null;
  await batch.destroy();
  return batch;
};

const getEnrolledStudents = async (batchId) => {
  const batch = await AcademyBatch.findByPk(batchId);
  if (!batch) throw new Error("Batch not found");

  return await AcademyStudent.findAll({
    where: {
      batchId,
    },
  });
};

const enrollStudent = async (batchId, studentId, transaction = null) => {
  const batch = await AcademyBatch.findByPk(batchId, { transaction });
  if (!batch) throw new Error("Batch not found");

  // Check if student is already enrolled
  if (batch.enrolledStudents.includes(studentId)) {
    return batch;
  }

  // Add student to batch
  const updatedEnrolledStudents = [...batch.enrolledStudents, studentId];
  const updatedTotalStudents = batch.totalStudents + 1;

  // Check if batch is full
  if (updatedTotalStudents > batch.maxStudents) {
    throw new Error("Batch is full");
  }

  return await batch.update(
    {
      enrolledStudents: updatedEnrolledStudents,
      totalStudents: updatedTotalStudents,
    },
    { transaction }
  );
};

const unenrollStudent = async (batchId, studentId, transaction = null) => {
  const batch = await AcademyBatch.findByPk(batchId, { transaction });
  if (!batch) throw new Error("Batch not found");

  // Check if student is enrolled
  if (!batch.enrolledStudents.includes(studentId)) {
    return batch;
  }

  // Remove student from batch
  const updatedEnrolledStudents = batch.enrolledStudents.filter(
    (id) => id !== studentId
  );
  const updatedTotalStudents = batch.totalStudents - 1;

  return await batch.update(
    {
      enrolledStudents: updatedEnrolledStudents,
      totalStudents: updatedTotalStudents,
    },
    { transaction }
  );
};

const getAvailableBatches = async (filters = {}) => {
  // Validate filters first
  if (filters.batchId) {
    throw new Error(
      "Invalid filter: batchId is not allowed in getAvailableBatches"
    );
  }

  // Create a clean where object with only allowed filters
  const allowedFilters = ["academyId", "sport", "ageGroup", "daysOfWeek"];
  const where = {
    status: "active",
    totalStudents: {
      [Op.lt]: sequelize.col("maxStudents"),
    },
  };

  allowedFilters.forEach((filter) => {
    if (filters[filter]) {
      where[filter] = filters[filter];
    }
  });

  // Handle daysOfWeek specifically
  if (filters.daysOfWeek && filters.daysOfWeek.length > 0) {
    where.daysOfWeek = {
      [Op.overlap]: filters.daysOfWeek,
    };
  }

  return await AcademyBatch.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
};

// Add method to get batch students with scores
const getStudentsWithScores = async (batchId) => {
  const { AcademyStudent } = require("../../../database");

  return await AcademyStudent.findAll({
    where: { batchId },
    attributes: [
      "studentId",
      "name",
      "sport",
      "currentScores",
      "achievementBadges",
      "scoreTrends",
      "createdAt",
    ],
    order: [
      [
        sequelize.literal(`("currentScores"->>'overall')::float`),
        "DESC NULLS LAST",
      ],
    ],
  });
};

// Add method to calculate batch score metrics
const calculateBatchScoreMetrics = async (batchId) => {
  const students = await getStudentsWithScores(batchId);

  if (students.length === 0) {
    return {
      averageScore: 0,
      totalStudents: 0,
      scoreDistribution: {},
      topPerformers: [],
    };
  }

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
    .slice(0, 5)
    .map((student) => ({
      studentId: student.studentId,
      name: student.name,
      score: student.currentScores.overall,
      achievements: student.achievementBadges?.length || 0,
    }));

  return {
    averageScore: parseFloat(averageScore),
    totalStudents: students.length,
    studentsWithScores: studentsWithScores.length,
    scoreDistribution,
    topPerformers,
  };
};

// Add method to get batch performance trends
const getBatchPerformanceTrends = async (batchId, months = 6) => {
  const { MonthlyStudentMetric, Month } = require("../../../database");

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  const trends = await MonthlyStudentMetric.findAll({
    where: {
      batchId,
      createdAt: { [Op.gte]: cutoffDate },
    },
    include: [
      {
        model: Month,
        as: "month",
        attributes: ["monthName", "year", "monthNumber"],
      },
    ],
    order: [["createdAt", "ASC"]],
  });

  return trends.map((trend) => ({
    month: `${trend.month.monthName} ${trend.month.year}`,
    monthNumber: trend.month.monthNumber,
    averageScores: trend.averageScores,
    scoreImprovements: trend.scoreImprovements,
    achievementsEarned: trend.achievementsEarned?.length || 0,
  }));
};

module.exports = {
  createBatch,
  getBatchById,
  getBatchesByAcademy,
  updateBatch,
  deleteBatch,
  getEnrolledStudents,
  enrollStudent,
  unenrollStudent,
  getAvailableBatches,
  getStudentsWithScores,
  calculateBatchScoreMetrics,
  getBatchPerformanceTrends,
};
