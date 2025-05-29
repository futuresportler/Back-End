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
        type: DataTypes.JSONB,
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
      coachFeedback: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      // Add current score tracking
      currentScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Current/latest scores for quick access",
        // Structure: {
        //   "football": {
        //     overall: 8.2,
        //     lastUpdated: "2024-01-31",
        //     breakdown: {
        //       technique: 8.5,
        //       fitness: 7.0,
        //       teamwork: 9.0,
        //       gameUnderstanding: 8.0
        //     }
        //   }
        // }
      },
      achievementFlags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
        comment: "Current achievement flags and milestones",
        // Example: ["first_goal", "technique_master", "leadership_badge", "fitness_level_3"]
      },
      scoreHistory: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score progression summary",
        // Structure: {
        //   "football": {
        //     initialScore: 5.0,
        //     currentScore: 8.2,
        //     improvement: 3.2,
        //     trend: "improving", // "improving", "stable", "declining"
        //     lastThreeMonths: [7.5, 7.8, 8.2]
        //   }
        // }
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
