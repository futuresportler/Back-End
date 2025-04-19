// models/postgres/academyAttendance.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyAttendance",
    {
      attendanceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "leave"),
        defaultValue: "present",
      },
      date: DataTypes.DATEONLY,
      notes: DataTypes.TEXT
    },
    { timestamps: false }
  );
};