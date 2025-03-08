const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Role = sequelize.define("Role", {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role_name: { type: DataTypes.STRING, unique: true, allowNull: false },
  permissions: { type: DataTypes.JSON },
});

module.exports = Role;
