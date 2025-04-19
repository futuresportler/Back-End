// models/postgres/turfSlot.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfGroundSlot",
    {
      slotId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      availability: {
        type: DataTypes.ENUM("available", "booked", "blocked"),
        defaultValue: "available",
      },
      price: DataTypes.DECIMAL(10,2),
    },
    { timestamps: true }
  );
};