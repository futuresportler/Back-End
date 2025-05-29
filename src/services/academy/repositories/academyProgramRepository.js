const {
  AcademyProgram,
  AcademyStudent,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

const createProgram = async (programData) => {
  return await AcademyProgram.create(programData);
};

const getProgramById = async (programId) => {
  return await AcademyProgram.findByPk(programId);
};

const getProgramsByAcademy = async (academyId) => {
  return await AcademyProgram.findAll({
    where: { academyId },
  });
};

const updateProgram = async (programId, updateData) => {
  const program = await AcademyProgram.findByPk(programId);
  if (!program) return null;
  return await program.update(updateData);
};

const deleteProgram = async (programId) => {
  const program = await AcademyProgram.findByPk(programId);
  if (!program) return null;
  await program.destroy();
  return program;
};

const enrollStudent = async (programId, studentId, transaction = null) => {
  const program = await AcademyProgram.findByPk(programId, { transaction });
  if (!program) throw new Error("Program not found");

  // Check if student is already enrolled
  if (
    program.enrolledStudents &&
    program.enrolledStudents.includes(studentId)
  ) {
    throw new Error("Student already enrolled in this program");
  }

  // Check if program is full
  if (program.bookedSpots >= program.totalSpots) {
    throw new Error("Program is full");
  }

  // Add student to program
  const enrolledStudents = program.enrolledStudents || [];
  await program.update(
    {
      enrolledStudents: [...enrolledStudents, studentId],
      bookedSpots: program.bookedSpots + 1,
    },
    { transaction }
  );

  return program;
};

const unenrollStudent = async (programId, studentId, transaction = null) => {
  const program = await AcademyProgram.findByPk(programId, { transaction });
  if (!program) throw new Error("Program not found");

  // Check if student is enrolled
  if (
    !program.enrolledStudents ||
    !program.enrolledStudents.includes(studentId)
  ) {
    throw new Error("Student not enrolled in this program");
  }

  // Remove student from program
  const enrolledStudents = program.enrolledStudents.filter(
    (id) => id !== studentId
  );
  await program.update(
    {
      enrolledStudents,
      bookedSpots: Math.max(0, program.bookedSpots - 1),
    },
    { transaction }
  );

  return program;
};

const getEnrolledStudents = async (programId) => {
  const program = await AcademyProgram.findByPk(programId);
  if (!program) throw new Error("Program not found");

  if (!program.enrolledStudents || program.enrolledStudents.length === 0) {
    return [];
  }

  return await AcademyStudent.findAll({
    where: {
      studentId: {
        [Op.in]: program.enrolledStudents,
      },
    },
  });
};
// Add this function to academyProgramRepository.js
const getPopularProgramsByAcademy = async (academyId, limit = 5) => {
  // Find all programs for the academy
  const programs = await AcademyProgram.findAll({
    where: { academyId },
    attributes: [
      "programId",
      "programName",
      "fee",
      "sport",
      "bookedSpots",
      "totalSpots",
      "enrolledStudents",
      "createdAt",
    ],
    order: [
      [sequelize.literal("array_length(enrolled_students, 1) DESC NULLS LAST")],
      ["createdAt", "DESC"],
    ],
    limit,
  });

  return programs;
};

// Add method to get program students with scores
const getStudentsWithScores = async (programId) => {
  const { AcademyStudent } = require("../../../database");

  return await AcademyStudent.findAll({
    where: { programId },
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

// Add method to calculate program score metrics
const calculateProgramScoreMetrics = async (programId) => {
  const students = await getStudentsWithScores(programId);

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

module.exports = {
  createProgram,
  getProgramById,
  getProgramsByAcademy,
  updateProgram,
  deleteProgram,
  enrollStudent,
  unenrollStudent,
  getEnrolledStudents,
  getPopularProgramsByAcademy,
  getStudentsWithScores,
  calculateProgramScoreMetrics,
};
