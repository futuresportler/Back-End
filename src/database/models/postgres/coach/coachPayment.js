// models/postgres/coachPayment.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachPayment",
    {
      paymentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachProfiles",
          key: "coachId",
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
      slotId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachSlots",
          key: "slotId",
        },
      },
      amount: DataTypes.DECIMAL(10, 2),
      paymentMethod: DataTypes.STRING,
      transactionId: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
    },
    { timestamps: true },
  )
}
