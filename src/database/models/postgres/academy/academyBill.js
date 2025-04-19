// models/postgres/academyBill.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyBill",
    {
      billId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      amount: DataTypes.DECIMAL(10,2),
      dueDate: DataTypes.DATEONLY,
      paidDate: DataTypes.DATEONLY,
      status: {
        type: DataTypes.ENUM("pending", "paid", "overdue"),
        defaultValue: "pending",
      },
    },
    { timestamps: true }
  );
};