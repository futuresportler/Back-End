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
        programId: {
          type: DataTypes.UUID,
          references: {
            model: "AcademyPrograms", // Add proper reference
            key: "programId",
          },
        },
        batchId: {
          type: DataTypes.UUID,
          references: {
            model: "AcademyBatches", // Add proper reference
            key: "batchId",
          },
        },
        monthId: {
          type: DataTypes.UUID,
          references: {
            model: "Months", // Add proper reference
            key: "monthId",
          },
        }
      },
      { timestamps: false }
    );
  };