const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const AcademyProfile = require("./academyProfile");
const CoachProfile = require("./coachProfile");

const CoachAcademy = sequelize.define("CoachAcademy", {
  coach_academy_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  coach_id: { type: DataTypes.UUID, references: { model: CoachProfile, key: "coach_id" } },
  academy_id: { type: DataTypes.UUID, references: { model: AcademyProfile, key: "academy_id" } },
  joining_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING, defaultValue: "active" },
  position: { type: DataTypes.STRING }
});

module.exports = CoachAcademy;
