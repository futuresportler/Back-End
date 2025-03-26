const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Review = sequelize.define("Review", {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reviewer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.ENUM("Coach", "Academy", "Turf"),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5,
    },
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Review;
