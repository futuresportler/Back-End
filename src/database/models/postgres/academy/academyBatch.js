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
      batchName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      daysOfWeek: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        // Example: ["Monday", "Wednesday", "Friday"]
      },
      ageGroup: {
        type: DataTypes.STRING,
        allowNull: false,
        // Example: "Children", "Teens", "Adults"
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      maxStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fee: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      sport: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("active", "inactive", "completed"),
        defaultValue: "active",
      },
      startDate: DataTypes.DATEONLY,
      endDate: DataTypes.DATEONLY,
      description: DataTypes.TEXT,
      level: {
        type: DataTypes.STRING,
        // Example: "Beginner", "Intermediate", "Advanced"
      },
      location: DataTypes.STRING,
    },
    { timestamps: true }
  );
};
