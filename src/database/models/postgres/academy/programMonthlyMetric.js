// models/postgres/academy/programMonthlyMetric.js
const { DataTypes } = require("sequelize")

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
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Months",
          key: "monthId",
        },
      },
      totalBookings: DataTypes.INTEGER,
      completedSessions: DataTypes.INTEGER,
      cancelledSessions: DataTypes.INTEGER,
      revenue: DataTypes.DECIMAL(10, 2),
      newStudents: DataTypes.INTEGER,
      totalStudents: DataTypes.INTEGER,
      averageRating: DataTypes.DECIMAL(3, 2),
      totalReviews: DataTypes.INTEGER,
      inquiries: DataTypes.INTEGER,
      conversions: DataTypes.INTEGER,
      conversionRate: DataTypes.DECIMAL(5, 2),
      profileViews: DataTypes.INTEGER,
    },
    { timestamps: true }
  )
}