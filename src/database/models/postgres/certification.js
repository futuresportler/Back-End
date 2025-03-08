const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../config/database");

const Certification = sequelize.define("Certification", {
  certification_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  issuing_organization: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  validity_period: { type: DataTypes.INTEGER } // in months
});

module.exports = Certification;
