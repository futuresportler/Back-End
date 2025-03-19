const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const Sport = require("./sport");
const AcademyProfile = require("./academyProfile");

const AcademySport = sequelize.define("AcademySport", {
  academy_sport_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academyId: { type: DataTypes.UUID, references: { model: AcademyProfile, key: "academyId" } },
  sport_id: { type: DataTypes.INTEGER, references: { model: Sport, key: "sport_id" } },
  programs_offered: { type: DataTypes.JSON },
  price_range: { type: DataTypes.STRING }
});

module.exports = AcademySport;
