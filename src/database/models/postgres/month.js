// models/postgres/month.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Month",
    {
      monthId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      monthNumber: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 12 }
      },
      yearId: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: 'CASCADE', // Optional: define behavior on delete
      }
    },
    { timestamps: false }
  );
};