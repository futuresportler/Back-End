// models/postgres/academy/academyReview.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyReview",
    {
      reviewId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyProfiles",
          key: "academyId",
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "userId",
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 }
      },
      comment: DataTypes.TEXT,
      verifiedPurchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: true }
  );
};