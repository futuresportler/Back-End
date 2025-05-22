// src/database/models/postgres/coach/monthlyCoachMetric.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "MonthlyCoachMetric",
    {
      metricId: {
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
      newStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      activeStudents: {
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
      sessionHours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      utilization: {
        type: DataTypes.DECIMAL(5, 2), // Percentage of available slots that were booked
        defaultValue: 0,
      },
      studentProgress: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      // Add batch analytics component
      batchMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        // Structure: { 
        //   "batchId1": { 
        //     name: "Batch Name",
        //     sessions: 10, 
        //     revenue: 5000, 
        //     students: 8,
        //     rating: 4.5,
        //     utilization: 80
        //   } 
        // }
      },
      // Revenue breakdown by day of week
      dailyRevenue: {
        type: DataTypes.JSON,
        defaultValue: {
          "Monday": 0, "Tuesday": 0, "Wednesday": 0, 
          "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
        },
      },
      // Sessions breakdown by hour of day
      hourlySessionDistribution: {
        type: DataTypes.JSON,
        defaultValue: {},
        // E.g., { "06:00": 5, "07:00": 8, ... }
      },
      // Performance metrics
      growthRate: {
        type: DataTypes.DECIMAL(5, 2), // Percentage growth from previous month
        defaultValue: 0,
      },
      retentionRate: {
        type: DataTypes.DECIMAL(5, 2), // Percentage of students retained from previous month
        defaultValue: 0,
      },
      totalRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      utilization: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: "Percentage of available time slots that were booked",
      },
      bookingSources: {
      type: DataTypes.JSON,
        defaultValue: {
          "website": 0,
          "app": 0, 
          "direct": 0,
          "partners": 0,
          "other": 0
        },
      allowNull: false,
    },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId", "monthId"],
          unique: true,
        },
      ],
    }
  )
}