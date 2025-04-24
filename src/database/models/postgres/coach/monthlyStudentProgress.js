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
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Months",
          key: "monthId",
        },
      },
      performance: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      feedback: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      grades: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      attendanceSummary: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      missedSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      goalsAchieved: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      newGoals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId", "userId", "monthId"],
          unique: true,
        },
      ],
    },
  )
}
