// models/postgres/coachStudent.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachStudent",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachProfiles",
          key: "coachId",
        },
        onDelete: "CASCADE",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User", // Changed from "Users" to "User"
          key: "userId",
        },
        onDelete: "CASCADE",
      },
      enrollmentDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("active", "completed", "paused"),
        defaultValue: "active",
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      goals: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      progress: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      feedback: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      grades: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      totalSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedSessions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId", "userId"],
          unique: true,
        },
      ],
    },
  )
}
