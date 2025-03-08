const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const User = require("./user");

const AcademyProfile = sequelize.define("AcademyProfile", {
  academy_id: { type: DataTypes.UUID, primaryKey: true, references: { model: User, key: "user_id" } },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  address: { type: DataTypes.STRING },
  facilities: { type: DataTypes.JSON },
  sports_offered: { type: DataTypes.ARRAY(DataTypes.STRING) },
  founding_year: { type: DataTypes.INTEGER },
  website: { type: DataTypes.STRING },
  contact_email: { type: DataTypes.STRING },
  contact_phone: { type: DataTypes.STRING }
});

module.exports = AcademyProfile;
