// models/postgres/academyStudent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyStudent",
    {
      enrollmentType: {
        type: DataTypes.ENUM("manual", "auto", "third_party"),
        defaultValue: "manual",
      },
      source: DataTypes.STRING, // For 3rd party integrations
      name: DataTypes.STRING,
      sportId: DataTypes.UUID,
      sportLevel: DataTypes.STRING,
      age: DataTypes.INTEGER,
      batchName: DataTypes.STRING,
      attendance: DataTypes.DECIMAL(5, 2),
      performance: DataTypes.STRING,
      feeStatus: DataTypes.ENUM("paid", "pending", "partial"),
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.TEXT,
      dob: DataTypes.DATEONLY,
      joinedDate: DataTypes.DATEONLY,
      guardianName: DataTypes.STRING,
      guardianMobile: DataTypes.STRING,
      guardianEmail: DataTypes.STRING,
      emergencyContact: DataTypes.STRING,
      medicalInfo: DataTypes.TEXT,
      achievements: DataTypes.ARRAY(DataTypes.STRING),
      skillsAssessment: DataTypes.JSON,
      coachFeedback: DataTypes.ARRAY(DataTypes.JSON),
    },
    { timestamps: true }
  );
};
