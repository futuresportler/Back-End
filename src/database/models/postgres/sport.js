const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");

const Sport = sequelize.define("Sport", {
  sport_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING }
});

module.exports = Sport;
