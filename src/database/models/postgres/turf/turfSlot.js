// models/postgres/turf/turfSlot.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfSlot",
    {
      slotId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      turfId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "TurfProfiles",
          key: "turfId",
        },
      },
      groundId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "TurfGrounds",
          key: "groundId",
        },
      },
      dayId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Days",
          key: "dayId", // Changed from "id" to "dayId"
        },
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("available", "booked", "blocked"),
        defaultValue: "available",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "User", // Changed from "Users" to "User"
          key: "userId",
        },
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "confirmed", "refunded", "cancelled"),
        allowNull: true,
      },
      bookingType: {
        type: DataTypes.ENUM("hourly", "half_day", "full_day"),
        defaultValue: "hourly",
      },
    },
    { timestamps: true },
  )
}
