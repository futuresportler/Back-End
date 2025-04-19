// models/postgres/turfMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "DailyTurfMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingsCount: DataTypes.INTEGER,
      revenue: DataTypes.DECIMAL(10,2),
      utilizationRate: DataTypes.DECIMAL(5,2),
    },
    { timestamps: false }
  );
};