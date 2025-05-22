const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Time references
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Months",
          key: "monthId",
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
      // Traffic & Conversion Metrics
      profileViews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      uniqueVisitors: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      inquiries: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Enrollment Metrics
      newEnrollments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Financial Metrics
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      pendingFees: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      // Activity Metrics
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Performance Metrics
      averageRating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Conversion Metrics
      conversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      // Program specific metrics are stored as JSON
      programMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      enrollments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Total number of student enrollments in this month",
      },
      utilization: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: "Percentage of maximum batch capacity utilized",
      },
      enrollmentSources: {
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
          fields: ["academyId", "monthId"],
          unique: true
        }
      ]
    }
  );
};