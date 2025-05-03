// models/postgres/academy/academyAttendance.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyAttendance",
    {
      attendanceId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dayId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Days",
          key: "dayId",
        },
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyPrograms",
          key: "programId",
        },
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Changed from "Users" to "User"
          key: "userId",
        },
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "excused"),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
