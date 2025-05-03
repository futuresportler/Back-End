// models/postgres/turf/slotRequest.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "SlotRequest",
    {
      requestId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      slotId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "TurfSlots",
          key: "slotId",
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Changed from "Users" to "User"
          key: "userId",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
        defaultValue: "pending",
      },
      requestDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      teamSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      purpose: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
