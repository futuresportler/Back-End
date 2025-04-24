// models/postgres/coach/monthlyStudentProgress.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "MonthlyStudentProgress",
    {
      progressId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachProfiles",
          key: "coachId",
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Changed from "Users" to "User"
          key: "userId",
        },
      },
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Months",
          key: "monthId",
        },
      },
      // Progress metrics
      attendanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      skillProgress: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      performanceRating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 10 },
        allowNull: true,
      },
      goalsAchieved: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      newGoals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      coachFeedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      studentFeedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Summary
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Recommendations
      recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
