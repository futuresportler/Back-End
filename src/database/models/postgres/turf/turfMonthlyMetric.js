const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfMonthlyMetric",
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
      turfId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "TurfProfiles",
          key: "turfId",
        },
      },
      // Booking Metrics
      totalBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cancelledBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Financial Metrics
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
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
      // Utilization
      utilization: {
        type: DataTypes.DECIMAL(5, 2), // percentage
        defaultValue: 0,
      },
      totalSlots: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // Sport-specific revenue breakdown
      sportRevenue: {
        type: DataTypes.JSON,
        defaultValue: {},
        // E.g., { "Football": 5000, "Cricket": 3000 }
      },
      // Time-based metrics - bookings by hour
      hourlyBookings: {
        type: DataTypes.JSON,
        defaultValue: {},
        // E.g., { "06:00": 5, "07:00": 8, ... }
      },
      // Day-of-week metrics
      dailyBookings: {
        type: DataTypes.JSON,
        defaultValue: {
          "Monday": 0, "Tuesday": 0, "Wednesday": 0, 
          "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
        },
      },
      // Ground-specific metrics
      groundMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        // Structure: { "groundId1": { bookings: 10, revenue: 5000, ... } }
      },
      revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false,
      },
      totalBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      utilization: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        allowNull: false,
        comment: "Percentage of available slots that were booked",
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
          fields: ["turfId", "monthId"],
          unique: true
        }
      ]
    }
  );
};