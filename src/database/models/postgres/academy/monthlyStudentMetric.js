//models/postgres/academy/monthlyStudentMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    return sequelize.define(
      "MonthlyStudentMetric",
      {
        metricId: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        performance: DataTypes.JSON,
        feedback: DataTypes.ARRAY(DataTypes.JSON),
        feeStatus: DataTypes.STRING,
        attendanceSummary: DataTypes.JSON,
        programId: DataTypes.UUID,
        batchId: DataTypes.UUID,
        monthId: DataTypes.UUID
      },
      { timestamps: false }
    );
  };