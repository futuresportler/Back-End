// models/postgres/coachStudent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CoachStudent = sequelize.define(
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
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true, // Changed from false to true to make it optional
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      // Add fields for students without userId (similar to AcademyStudent)
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },
      sport: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      level: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      achievements: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      grades: {
        type: DataTypes.JSON,
        defaultValue: {},

      },
      guardianName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      guardianMobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        defaultValue: "active",
      },
      achievements: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      coachFeedback: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        // Modified unique index to only apply when userId is not null
        {
          unique: true,
          fields: ["coachId", "userId"],
          where: {
            userId: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        {
          fields: ["batchId"],
        },
      ],
    }
  );

  return CoachStudent;
};
