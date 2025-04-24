// models/postgres/day.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "Day",
    {
      dayId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        unique: true,
        allowNull: false,
      },
      dayNumber: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 31 },
      },
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    { timestamps: false },
  )
}
