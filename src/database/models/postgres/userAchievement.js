const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");
const User = require("./user");

const UserAchievement = sequelize.define("UserAchievement", {
  achievement_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.UUID, references: { model: User, key: "user_id" } },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date_achieved: { type: DataTypes.DATE, allowNull: false },
  verification_status: { type: DataTypes.STRING, defaultValue: "pending" },
  documents_url: { type: DataTypes.STRING }
});

module.exports = UserAchievement;
