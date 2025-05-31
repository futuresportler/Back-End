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
      progressTracking: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment:
          "Quarterly progress tracking for coach students with personalized metrics",
        // Structure: {
        //   "2024": {
        //     "Q1": {
        //       "football": {
        //         coachingType: "1-on-1", // "1-on-1", "group", "batch"
        //         sessionsPlanned: 12,
        //         sessionsCompleted: 11,
        //         skills: {
        //           technique: { initial: 5.0, current: 7.0, target: 8.0, sessions: 4 },
        //           fitness: { initial: 6.0, current: 7.5, target: 8.0, sessions: 3 },
        //           mental: { initial: 6.5, current: 8.0, target: 8.5, sessions: 2 },
        //           tactical: { initial: 5.5, current: 6.8, target: 7.5, sessions: 2 }
        //         },
        //         personalizedGoals: {
        //           primary: "improve_ball_control",
        //           secondary: ["increase_confidence", "better_positioning"],
        //           achieved: ["basic_dribbling", "improved_stamina"],
        //           inProgress: ["advanced_passing", "game_reading"]
        //         },
        //         coachNotes: [
        //           { date: "2024-01-15", note: "Great improvement in ball control", category: "technique" },
        //           { date: "2024-02-01", note: "Confidence building well", category: "mental" }
        //         ],
        //         parentFeedback: [
        //           { date: "2024-02-15", feedback: "Child enjoys sessions", rating: 5 }
        //         ],
        //         challenges: ["confidence_in_competition", "consistency"],
        //         breakthroughs: ["first_successful_tackle", "improved_stamina"],
        //         nextQuarterFocus: ["competition_preparation", "advanced_skills"]
        //       }
        //     }
        //   }
        // }
      },
      coachingPlan: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Personalized coaching plan and curriculum tracking",
        // Structure: {
        //   currentPlan: {
        //     planId: "uuid",
        //     createdDate: "2024-01-01",
        //     duration: "6_months",
        //     objectives: ["skill_development", "fitness_improvement", "competition_ready"],
        //     curriculum: {
        //       phase1: { weeks: "1-8", focus: "fundamentals", completed: true },
        //       phase2: { weeks: "9-16", focus: "intermediate_skills", completed: false },
        //       phase3: { weeks: "17-24", focus: "advanced_techniques", completed: false }
        //     }
        //   },
        //   adaptations: [
        //     { date: "2024-02-15", reason: "student_preference", changes: ["more_game_practice"] }
        //   ],
        //   parentInputs: [
        //     { date: "2024-01-30", input: "focus_on_confidence", priority: "high" }
        //   ]
        // }
      },
      performanceMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Detailed performance metrics and analytics for coaching",
        // Structure: {
        //   sessionsAnalytics: {
        //     averageIntensity: 7.5,
        //     peakPerformanceDays: ["Monday", "Thursday"],
        //     improvementVelocity: 0.3, // points per session
        //     consistencyScore: 8.2,
        //     engagementLevel: 9.0
        //   },
        //   skillProgression: {
        //     fastestImproving: "teamwork",
        //     slowestImproving: "fitness",
        //     plateauAreas: [],
        //     breakthroughMoments: [
        //       { skill: "dribbling", date: "2024-02-10", improvement: 2.0 }
        //     ]
        //   },
        //   parentSatisfaction: {
        //     currentRating: 4.8,
        //     feedbackHistory: [4.5, 4.6, 4.8],
        //     concerns: [],
        //     appreciation: ["personalized_attention", "visible_progress"]
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
