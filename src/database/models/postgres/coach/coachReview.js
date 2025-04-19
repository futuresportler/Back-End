// models/postgres/coachReview.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachReview",
    {
      reviewId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 }
      },
      comment: DataTypes.TEXT,
      verifiedSession: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    { timestamps: true }
  );
};