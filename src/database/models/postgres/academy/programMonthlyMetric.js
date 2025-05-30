// models/postgres/academy/programMonthlyMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ProgramMonthlyMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyPrograms",
          key: "programId",
        },
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyProfiles",
          key: "academyId",
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
      totalBookings: DataTypes.INTEGER,
      totalSessions: DataTypes.INTEGER,
      completedSessions: DataTypes.INTEGER,
      cancelledSessions: DataTypes.INTEGER,
      revenue: DataTypes.DECIMAL(10, 2),
      newStudents: DataTypes.INTEGER,
      totalStudents: DataTypes.INTEGER,
      studentProgress: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      totalRevenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      averageRating: DataTypes.DECIMAL(3, 2),
      totalReviews: DataTypes.INTEGER,
      inquiries: DataTypes.INTEGER,
      conversions: DataTypes.INTEGER,
      conversionRate: DataTypes.DECIMAL(5, 2),
      profileViews: DataTypes.INTEGER,
      // Add program-level score analytics
      programScoreMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Program-wide score analytics and insights",
        // Structure: {
        //   averageProgramScore: 8.1,
        //   scoreDistribution: {
        //     beginner: { count: 15, avgScore: 6.2 },
        //     intermediate: { count: 25, avgScore: 7.8 },
        //     advanced: { count: 10, avgScore: 9.1 }
        //   },
        //   programEffectiveness: 85.5, // percentage
        //   completionRateByScore: {
        //     "8.0+": 95,
        //     "6.0-7.9": 82,
        //     "<6.0": 65
        //   }
        // }
      },
      curriculumEffectiveness: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Curriculum effectiveness based on student scores",
        // Structure: {
        //   modulePerformance: {
        //     "fundamentals": { avgScore: 8.5, completionRate: 98 },
        //     "advanced_techniques": { avgScore: 7.2, completionRate: 87 }
        //   },
        //   skillDevelopmentRate: 0.9, // points per month
        //   recommendedAdjustments: [
        //     "Increase practical sessions for advanced techniques"
        //   ]
        // }
      },
      graduationReadiness: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Students ready for graduation/level advancement",
        // Structure: {
        //   readyForAdvancement: 12,
        //   requiresMoreTime: 8,
        //   graduationCriteria: {
        //     minimumScore: 8.0,
        //     consistencyRequired: 3, // months
        //     skillRequirements: ["technique", "fitness", "game_understanding"]
        //   }
        // }
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["programId", "monthId"],
        },
        {
          fields: ["academyId", "monthId"],
        },
      ],
    }
  );
};
