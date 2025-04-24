// models/postgres/turfReview.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfReview",
    {
      reviewId: {
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "TurfPayments",
          key: "paymentId",
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
