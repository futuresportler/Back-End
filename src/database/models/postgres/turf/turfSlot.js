// Add groundId to TurfSlot model
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
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Days",
          key: "id",
        },
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
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
          model: "Users",
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
