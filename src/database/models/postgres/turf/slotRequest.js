// models/postgres/slotRequest.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SlotRequest",
    {
      requestId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      requestedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: true }
  );
};