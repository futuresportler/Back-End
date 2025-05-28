// src/database/models/postgres/coach/batchMonthlyMetric.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "BatchMonthlyMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachBatches",
          key: "batchId",
        },
        onDelete: "CASCADE",
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachProfiles",
          key: "coachId",
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
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cancelledSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      activeStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      newStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      studentProgress: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      utilization: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      // Daily distribution
      dailyRevenue: {
        type: DataTypes.JSON,
        defaultValue: {
          "Monday": 0, "Tuesday": 0, "Wednesday": 0, 
          "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
        },
      },
      // Student attendance rate
      attendanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["batchId", "monthId"],
          unique: true,
        },
        {
          fields: ["coachId"],
        }
      ],
    }
  )
}