// models/postgres/coach/monthlyStudentProgress.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "MonthlyStudentProgress",
    {
      progressId: {
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
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "User",
          key: "userId",
        },
      },
      monthId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Months",
          key: "monthId",
        },
      },
      // Progress metrics
      attendanceRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
      skillProgress: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      // Add comprehensive score tracking
      sportScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Sport-specific scores and flags for the month",
        // Structure: {
        //   "football": {
        //     technique: { score: 8.5, flag: "excellent", notes: "Great ball control" },
        //     fitness: { score: 7.0, flag: "good", notes: "Improving stamina" },
        //     teamwork: { score: 9.0, flag: "outstanding", notes: "Natural leader" },
        //     overall: { score: 8.2, flag: "excellent" }
        //   },
        //   "basketball": { ... }
        // }
      },
      scoreFlags: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "Achievement flags and milestones reached during the month",
        // Structure: [
        //   { sport: "football", flag: "first_goal", date: "2024-01-15", description: "Scored first goal in match" },
        //   { sport: "football", flag: "technique_improvement", level: "significant", date: "2024-01-20" }
        // ]
      },
      scoreMetrics: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Detailed metrics and assessments for scoring",
        // Structure: {
        //   assessmentDate: "2024-01-31",
        //   assessedBy: "coachId",
        //   methodology: "practical_assessment",
        //   categories: {
        //     technical: { weight: 0.3, maxScore: 10 },
        //     physical: { weight: 0.25, maxScore: 10 },
        //     tactical: { weight: 0.25, maxScore: 10 },
        //     mental: { weight: 0.2, maxScore: 10 }
        //   }
        // }
      },
      quarterlyProgress: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Monthly contribution to quarterly progress tracking",
        // Structure: {
        //   quarter: "2024-Q1",
        //   monthInQuarter: 1, // 1, 2, or 3
        //   quarterlyGoals: ["improve_technique", "increase_fitness"],
        //   monthlyContribution: {
        //     goalsProgress: {
        //       "improve_technique": { target: 2.0, achieved: 0.8, remaining: 1.2 },
        //       "increase_fitness": { target: 1.5, achieved: 0.6, remaining: 0.9 }
        //     },
        //     skillDevelopment: {
        //       technique: { monthlyImprovement: 0.8, quarterlyTarget: 2.0 },
        //       fitness: { monthlyImprovement: 0.6, quarterlyTarget: 1.5 }
        //     }
        //   },
        //   cumulativeProgress: {
        //     quarterStartScore: 6.5,
        //     currentScore: 7.3,
        //     quarterTargetScore: 8.5,
        //     onTrackToMeetTarget: true
        //   }
        // }
      },
      progressInsights: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment:
          "AI-generated insights and recommendations for progress optimization",
        // Structure: {
        //   trends: {
        //     improving: ["teamwork", "game_understanding"],
        //     declining: [],
        //     stable: ["fitness"],
        //     volatile: ["technique"] // inconsistent performance
        //   },
        //   predictions: {
        //     nextMonthScore: 8.0,
        //     quarterEndScore: 8.4,
        //     confidenceLevel: 0.85,
        //     factorsInfluencing: ["consistent_attendance", "coach_feedback"]
        //   },
        //   recommendations: {
        //     immediate: ["focus_on_weak_foot_practice"],
        //     shortTerm: ["increase_game_time"],
        //     longTerm: ["consider_advanced_coaching"]
        //   },
        //   alerts: [
        //     { type: "plateau_warning", skill: "fitness", duration: 2 }
        //   ]
        // }
      },
      performanceRating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 10 },
        allowNull: true,
      },
      goalsAchieved: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      newGoals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      coachFeedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      studentFeedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Summary
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Recommendations
      recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { timestamps: true }
  );
};
