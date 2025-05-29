const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ProgramFeedback",
    {
      feedbackId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyPrograms",
          key: "programId",
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
      programAspects: {
        type: DataTypes.JSON,
        defaultValue: {},
        // E.g., { "curriculum": 5, "coaches": 4, "progress_tracking": 3 }
      },
      completionStatus: {
        type: DataTypes.ENUM('ongoing', 'completed', 'dropped'),
        allowNull: false,
      },
    },
    { timestamps: true }
  );
};