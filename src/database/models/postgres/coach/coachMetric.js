// models/postgres/coachMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sessionsConducted: DataTypes.INTEGER,
      earnings: DataTypes.DECIMAL(10,2),
      studentAttendance: DataTypes.DECIMAL(5,2),
    },
    { timestamps: false }
  );
};