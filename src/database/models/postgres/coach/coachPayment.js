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
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "CoachBatches",
          key: "batchId",
        },
      },
      amount: DataTypes.DECIMAL(10, 2),
      paymentMethod: DataTypes.STRING,
      transactionId: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
      paymentType: {
        type: DataTypes.ENUM("session", "monthly", "package"),
        defaultValue: "session",
      },
      paymentPeriod: {
        type: DataTypes.JSON,
        allowNull: true, // For monthly payments, this would contain month and year
      },
    },
    { timestamps: true },
  )
}
