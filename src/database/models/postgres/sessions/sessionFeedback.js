const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SessionFeedback",
    {
      feedbackId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sessionId: {
        type: DataTypes.UUID,
        allowNull: true,
        // Will reference the session table when created
      },
      entityType: {
        type: DataTypes.ENUM('academy_session', 'coach_session', 'batch_session', 'program_session'),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        // Can reference academy, coach, batch, or program depending on entityType
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
      feedbackType: {
        type: DataTypes.ENUM('student_to_session', 'coach_to_student', 'academy_to_coach'),
        allowNull: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    { 
      timestamps: true,
      indexes: [
        {
          fields: ["entityType", "entityId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["sessionId"],
        },
      ],
    }
  );
};