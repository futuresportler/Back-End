const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const AcademyProfile = require("./academyProfile");
const CoachProfile = require("./coachProfile");

const CoachAcademy = sequelize.define("CoachAcademy", {
  coach_academyId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  coachId: { type: DataTypes.UUID, references: { model: CoachProfile, key: "coachId" } },
  academyId: { type: DataTypes.UUID, references: { model: AcademyProfile, key: "academyId" } },
  joining_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  position: { type: DataTypes.STRING }
});

module.exports = CoachAcademy;
