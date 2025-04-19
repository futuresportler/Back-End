// models/postgres/turfPayment.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfPayment",
    {
      paymentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: DataTypes.DECIMAL(10,2),
      paymentMethod: DataTypes.STRING,
      transactionId: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
      },
    },
    { timestamps: true }
  );
};