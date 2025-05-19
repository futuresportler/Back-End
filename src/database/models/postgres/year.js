// models/postgres/year.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Year",
    {
      yearId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      year: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        validate: { min: 2020, max: 2100 },
      },
    },
    {
      timestamps: false,
      tableName: "sport_years", // Explicitly set a different table name to avoid conflicts
    }
  );
};
