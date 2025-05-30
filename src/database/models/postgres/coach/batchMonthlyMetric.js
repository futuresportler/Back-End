// src/database/models/postgres/coach/batchMonthlyMetric.js
const { DataTypes } = require("sequelize");

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
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Sunday: 0,
        },
      },
      // Student attendance rate
      attendanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      // Add batch-level score analytics
      batchScoreMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Aggregated score metrics for the entire batch",
        // Structure: {
        //   averageScore: 7.8,
        //   scoreDistribution: {
        //     excellent: 15, // students with 8.5+
        //     good: 25,      // students with 7.0-8.4
        //     average: 8,    // students with 5.0-6.9
        //     needsWork: 2   // students with <5.0
        //   },
        //   topPerformers: ["studentId1", "studentId2"],
        //   improvementCandidates: ["studentId3", "studentId4"]
        // }
      },
      scoreImprovements: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Batch-wide score improvements and trends",
        // Structure: {
        //   averageImprovement: 0.8,
        //   studentsImproved: 25,
        //   studentsDeclined: 3,
        //   studentsStable: 12,
        //   categoryImprovements: {
        //     technique: 0.9,
        //     fitness: 0.6,
        //     teamwork: 1.2
        //   }
        // }
      },
      achievementSummary: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Summary of achievements earned by batch students",
        // Structure: {
        //   totalAchievements: 45,
        //   uniqueAchievements: 12,
        //   popularAchievements: [
        //     { achievement: "first_goal", count: 8 },
        //     { achievement: "fitness_improvement", count: 12 }
        //   ]
        // }
      },
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
        },
      ],
    }
  );
};
