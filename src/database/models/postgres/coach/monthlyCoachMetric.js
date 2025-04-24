// models/postgres/coach/monthlyCoachMetric.js
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
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId", "monthId"],
          unique: true,
        },
      ],
    },
  )
}
