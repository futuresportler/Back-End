const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const CoachProfile = require("./coachProfile");
const Sport = require("./sport");

const CoachSport = sequelize.define("CoachSport", {
  coach_sport_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  coachId: { type: DataTypes.UUID, references: { model: CoachProfile, key: "coachId" } },
  sport_id: { type: DataTypes.INTEGER, references: { model: Sport, key: "sport_id" } },
  skill_level: { type: DataTypes.STRING },
  experience_years: { type: DataTypes.INTEGER }
});

module.exports = CoachSport;
