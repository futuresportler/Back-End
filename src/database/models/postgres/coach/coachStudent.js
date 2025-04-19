// models/postgres/coachStudent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachStudent",
    {
      enrollmentDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("active", "completed", "paused"),
        defaultValue: "active",
      },
      source: DataTypes.STRING, // For 3rd party integrations
    },
    { timestamps: true }
  );
};