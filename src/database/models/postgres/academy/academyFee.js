// models/postgres/academy/academyFee.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const AcademyFee = sequelize.define(
    "AcademyFee",
    {
      feeId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Foreign Keys
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "userId",
        },
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyProfiles",
          key: "academyId",
        },
      },
      // Program or Batch reference (one of these must be provided)
      programId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AcademyPrograms",
          key: "programId",
        },
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AcademyBatches",
          key: "batchId",
        },
      },
      // Fee details
      feeType: {
        type: DataTypes.ENUM("registration", "monthly", "quarterly", "annual", "special"),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // Dates
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      // Status
      status: {
        type: DataTypes.ENUM("pending", "partial", "paid", "overdue", "cancelled"),
        defaultValue: "pending",
        allowNull: false,
      },
      // Payment tracking
      paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      lastPaymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionIds: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      // Additional info
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      remindersSent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Soft deletes
      indexes: [
        {
          fields: ["studentId"],
        },
        {
          fields: ["academyId"],
        },
        {
          fields: ["programId"],
        },
        {
          fields: ["batchId"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["dueDate"],
        },
      ],
      validate: {
        // Ensure either programId or batchId is provided
        eitherProgramOrBatch() {
          if (!this.programId && !this.batchId) {
            throw new Error("Either programId or batchId must be provided")
          }
        },
      },
      hooks: {
        beforeValidate: (fee) => {
          // Calculate total amount if not provided
          if (!fee.totalAmount) {
            fee.totalAmount =
              Number.parseFloat(fee.amount || 0) +
              Number.parseFloat(fee.taxAmount || 0) -
              Number.parseFloat(fee.discountAmount || 0)
          }
        },
        beforeCreate: (fee) => {
          // Set status to overdue if due date is in the past
          if (new Date(fee.dueDate) < new Date() && fee.status === "pending") {
            fee.status = "overdue"
          }
        },
      },
    },
  )

  return AcademyFee
}
