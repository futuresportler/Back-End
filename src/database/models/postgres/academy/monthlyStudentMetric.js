//models/postgres/academy/monthlyStudentMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "MonthlyStudentMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      performance: DataTypes.JSON,
      feedback: DataTypes.ARRAY(DataTypes.JSON),
      feeStatus: DataTypes.STRING,
      attendanceSummary: DataTypes.JSON,
      programId: {
        type: DataTypes.UUID,
        references: {
          model: "AcademyPrograms", // Add proper reference
          key: "programId",
        },
      },
      batchId: {
        type: DataTypes.UUID,
        references: {
          model: "AcademyBatches", // Add proper reference
          key: "batchId",
        },
      },
      monthId: {
        type: DataTypes.UUID,
        references: {
          model: "Months", // Add proper reference
          key: "monthId",
        },
      },
      // Add score tracking to monthly metrics
      averageScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Average scores across all activities for the month",
        // Structure: {
        //   overall: 8.2,
        //   byCategory: {
        //     technique: 8.5,
        //     fitness: 7.0,
        //     teamwork: 9.0
        //   },
        //   bySport: {
        //     football: 8.2,
        //     basketball: 7.5
        //   }
        // }
      },
      scoreImprovements: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score improvements compared to previous month",
        // Structure: {
        //   overall: { previous: 7.5, current: 8.2, improvement: 0.7 },
        //   byCategory: {
        //     technique: { improvement: 0.8, trend: "improving" }
        //   }
        // }
      },
      achievementsEarned: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "New achievements and flags earned this month",
      },
    },
    { timestamps: false }
  );
};
