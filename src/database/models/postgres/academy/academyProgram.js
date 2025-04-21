// models/postgres/academyProgram.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyProgram",
    {
      programId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      programName: DataTypes.STRING,
      description: DataTypes.TEXT,
      fee: DataTypes.DECIMAL(10, 2),
      feeComponents: DataTypes.JSON,
      sport: DataTypes.STRING,
      ageGroup: DataTypes.STRING,
      duration: DataTypes.STRING,
      coachId: {
        type: DataTypes.UUID,
        references: { model: "CoachProfiles", key: "coachId" },
      },
      schedule: DataTypes.JSON,
      programDates: DataTypes.JSON,
      curriculum: DataTypes.JSON,
      totalSpots: DataTypes.INTEGER,
      bookedSpots: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      enrolledStudents: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        defaultValue: [],
      },
      features: DataTypes.ARRAY(DataTypes.STRING),
      paymentDueDate: DataTypes.DATEONLY,
      status: {
        type: DataTypes.ENUM("active", "inactive", "completed"),
        defaultValue: "active",
      },
    },
    { timestamps: true },
  )
}
