const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "BatchFeedback",
    {
      feedbackId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: false,
        // Can reference AcademyBatch or CoachBatch
      },
      batchType: {
        type: DataTypes.ENUM('academy', 'coach'),
        allowNull: false,
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
      feedbackAspects: {
        type: DataTypes.JSON,
        defaultValue: {},
        // E.g., { "coaching_quality": 5, "facilities": 4, "schedule": 3 }
      },
    },
    { timestamps: true }
  );
};