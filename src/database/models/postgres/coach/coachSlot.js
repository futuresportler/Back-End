// models/postgres/coachSlot.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachSlot",
    {
      slotId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      status: {
        type: DataTypes.ENUM("available", "booked", "cancelled"),
        defaultValue: "available",
      },
      sessionType: {
        type: DataTypes.ENUM("individual", "group"),
        defaultValue: "individual",
      },
    },
    { timestamps: true }
  );
};