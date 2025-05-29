// models/postgres/academyStudent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyStudent",
    {
      studentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enrollmentType: {
        type: DataTypes.ENUM("manual", "auto", "third_party"),
        defaultValue: "manual",
      },
      enrollmentSource: {
        type: DataTypes.ENUM("batch", "program", "both", "null"),
        defaultValue: "batch",
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "AcademyBatches", key: "batchId" },
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "AcademyPrograms", key: "programId" },
      },
      source: DataTypes.STRING, // For 3rd party integrations
      name: DataTypes.STRING,
      sport: DataTypes.STRING,
      sportLevel: DataTypes.STRING,
      age: DataTypes.INTEGER,
      batchName: DataTypes.STRING,
      attendance: DataTypes.DECIMAL(5, 2),
      performance: DataTypes.STRING,
      feeStatus: DataTypes.ENUM("paid", "pending", "partial"),
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.TEXT,
      dob: DataTypes.DATEONLY,
      joinedDate: DataTypes.DATEONLY,
      guardianName: DataTypes.STRING,
      guardianMobile: DataTypes.STRING,
      guardianEmail: DataTypes.STRING,
      emergencyContact: DataTypes.STRING,
      medicalInfo: DataTypes.TEXT,
      achievements: DataTypes.ARRAY(DataTypes.STRING),
      skillsAssessment: DataTypes.JSON,
      coachFeedback: DataTypes.ARRAY(DataTypes.JSON),
      currentScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Current scores across all sports and programs",
        // Structure: {
        //   programId1: {
        //     sport: "football",
        //     overall: 8.2,
        //     lastUpdated: "2024-01-31",
        //     breakdown: {
        //       technique: 8.5,
        //       fitness: 7.0,
        //       teamwork: 9.0
        //     }
        //   },
        //   batchId1: { ... }
        // }
      },
      achievementBadges: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "Academy-specific achievement badges and certifications",
        // Structure: [
        //   {
        //     badge: "monthly_champion",
        //     sport: "football",
        //     level: "intermediate",
        //     earnedDate: "2024-01-31",
        //     programId: "uuid"
        //   }
        // ]
      },
      scoreTrends: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score trends and analytics",
        // Structure: {
        //   "football": {
        //     monthlyProgression: [6.0, 6.5, 7.2, 8.2],
        //     improvementRate: 0.8, // points per month
        //     strongAreas: ["teamwork", "game_understanding"],
        //     improvementAreas: ["fitness", "technique"]
        //   }
        // }
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "graduated"),
        defaultValue: "active",
      },
    },
    { timestamps: true }
  );
};
