const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const User = require("./user");

const CoachProfile = sequelize.define("CoachProfile", {
  coach_id: { type: DataTypes.UUID, primaryKey: true, references: { model: User, key: "user_id" } },
  specialization: { type: DataTypes.STRING },
  experience_years: { type: DataTypes.INTEGER },
  biography: { type: DataTypes.TEXT },
  hourly_rate: { type: DataTypes.FLOAT },
  availability: { type: DataTypes.JSON },
  location: { type: DataTypes.STRING },
  certification_ids: { type: DataTypes.ARRAY(DataTypes.INTEGER) }
});



module.exports = CoachProfile;
