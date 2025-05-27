const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PromotionTransaction = sequelize.define(
    "PromotionTransaction",
    {
      promotionTransactionId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "promotion_transaction_id",
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "supplierId",
        references: {
          model: 'Suppliers',
          key: 'supplierId'
        }
      },
      serviceType: {
        type: DataTypes.ENUM("coach", "academy", "turf"),
        allowNull: false,
        field: "service_type",
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "service_id",
      },
      promotionPlan: {
        type: DataTypes.ENUM("basic", "premium", "platinum"),
        allowNull: false,
        field: "promotion_plan",
      },
      priorityValue: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: "priority_value",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "end_date",
      },
      status: {
        type: DataTypes.ENUM("pending", "paid", "expired", "cancelled"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        field: "payment_method",
      },
      transactionId: {
        type: DataTypes.STRING(255),
        field: "transaction_id",
      },
    },
    {
      tableName: "promotion_transactions",
      underscored: true,
      timestamps: true,
    }
  );

  PromotionTransaction.associate = (models) => {
    PromotionTransaction.belongsTo(models.Supplier, {
      foreignKey: "supplierId",
      as: "supplier",
    });
  };

  return PromotionTransaction;
};