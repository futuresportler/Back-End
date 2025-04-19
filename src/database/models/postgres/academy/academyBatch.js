// models/postgres/academyBatch.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyBatch",
    {
      batchId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      batchName: DataTypes.STRING,
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sportId: DataTypes.UUID, // References Sport table
    },
    { timestamps: true }
  );
};