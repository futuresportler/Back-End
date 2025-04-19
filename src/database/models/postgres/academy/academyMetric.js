// models/postgres/academyMetric.js
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
      dailyActiveStudents: DataTypes.INTEGER,
      newEnrollments: DataTypes.INTEGER,
      revenue: DataTypes.DECIMAL(10,2),
    },
    { timestamps: false }
  );
};