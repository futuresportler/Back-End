// models/postgres/academyStudent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyStudent",
    {
      studentId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      enrollmentType: {
        type: DataTypes.ENUM("manual", "auto", "third_party"),
        defaultValue: "manual",
      },
      enrollmentSource: {
        type: DataTypes.ENUM("batch", "program", "both", "null"),
        defaultValue: "batch",
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "AcademyBatches", key: "batchId" },
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "AcademyPrograms", key: "programId" },
      },
      source: DataTypes.STRING, // For 3rd party integrations
      name: DataTypes.STRING,
      sport: DataTypes.STRING,
      sportLevel: DataTypes.STRING,
      age: DataTypes.INTEGER,
      batchName: DataTypes.STRING,
      attendance: DataTypes.DECIMAL(5, 2),
      performance: DataTypes.STRING,
      feeStatus: DataTypes.ENUM("paid", "pending", "partial"),
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.TEXT,
      dob: DataTypes.DATEONLY,
      joinedDate: DataTypes.DATEONLY,
      guardianName: DataTypes.STRING,
      guardianMobile: DataTypes.STRING,
      guardianEmail: DataTypes.STRING,
      emergencyContact: DataTypes.STRING,
      medicalInfo: DataTypes.TEXT,
      achievements: DataTypes.ARRAY(DataTypes.STRING),
      skillsAssessment: DataTypes.JSON,
      coachFeedback: DataTypes.ARRAY(DataTypes.JSON),
      currentScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Current scores across all sports and programs",
        // Structure: {
        //   programId1: {
        //     sport: "football",
        //     overall: 8.2,
        //     lastUpdated: "2024-01-31",
        //     breakdown: {
        //       technique: 8.5,
        //       fitness: 7.0,
        //       teamwork: 9.0
        //     }
        //   },
        //   batchId1: { ... }
        // }
      },
      achievementBadges: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "Academy-specific achievement badges and certifications",
        // Structure: [
        //   {
        //     badge: "monthly_champion",
        //     sport: "football",
        //     level: "intermediate",
        //     earnedDate: "2024-01-31",
        //     programId: "uuid"
        //   }
        // ]
      },
      scoreTrends: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score trends and analytics",
        // Structure: {
        //   "football": {
        //     monthlyProgression: [6.0, 6.5, 7.2, 8.2],
        //     improvementRate: 0.8, // points per month
        //     strongAreas: ["teamwork", "game_understanding"],
        //     improvementAreas: ["fitness", "technique"]
        //   }
        // }
      },
      progressTracking: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Quarterly progress tracking per sport with detailed metrics",
        // Structure: {
        //   "2024": {
        //     "Q1": {
        //       "football": {
        //         startDate: "2024-01-01",
        //         endDate: "2024-03-31",
        //         skills: {
        //           technique: { initial: 6.0, current: 7.5, target: 8.0, improvement: 1.5 },
        //           fitness: { initial: 5.5, current: 6.8, target: 7.5, improvement: 1.3 },
        //           teamwork: { initial: 7.0, current: 8.2, target: 8.5, improvement: 1.2 },
        //           gameUnderstanding: { initial: 6.5, current: 7.8, target: 8.0, improvement: 1.3 }
        //         },
        //         overallScore: { initial: 6.25, current: 7.58, target: 8.0, improvement: 1.33 },
        //         attendance: { sessions: 24, attended: 22, percentage: 91.67 },
        //         achievements: ["first_goal", "improved_fitness", "team_player"],
        //         coachFeedback: "Excellent progress in ball control and team coordination",
        //         parentFeedback: "Very happy with the improvement shown",
        //         assessments: [
        //           { date: "2024-01-15", type: "practical", score: 6.5, notes: "Good foundation" },
        //           { date: "2024-03-15", type: "practical", score: 7.8, notes: "Significant improvement" }
        //         ],
        //         goals: {
        //           achieved: ["improve_ball_control", "increase_stamina"],
        //           pending: ["master_passing", "leadership_skills"],
        //           nextQuarter: ["advanced_techniques", "game_strategy"]
        //         },
        //         challenges: ["weather_disruptions", "peer_coordination"],
        //         recommendations: ["focus_on_weak_foot", "extra_fitness_sessions"]
        //       },
        //       "basketball": { /* similar structure */ }
        //     },
        //     "Q2": { /* similar structure for next quarter */ }
        //   }
        // }
      },
      quarterlyReports: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "Generated quarterly progress reports for parents and academy",
        // Structure: [
        //   {
        //     reportId: "uuid",
        //     quarter: "2024-Q1",
        //     generatedDate: "2024-04-01",
        //     sports: ["football", "basketball"],
        //     summary: {
        //       overallImprovement: 1.33,
        //       strongestSport: "football",
        //       areasOfFocus: ["fitness", "technique"],
        //       nextQuarterGoals: ["advanced_techniques", "competition_ready"]
        //     },
        //     reportUrl: "path/to/generated/report.pdf",
        //     sharedWith: ["parent", "coach", "academy"],
        //     status: "completed"
        //   }
        // ]
      },
      progressMilestones: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Key milestones and benchmarks tracking",
        // Structure: {
        //   "football": {
        //     beginner: { achieved: true, date: "2024-01-15", score: 6.0 },
        //     intermediate: { achieved: true, date: "2024-02-28", score: 7.0 },
        //     advanced: { achieved: false, targetDate: "2024-06-30", targetScore: 8.5 },
        //     expert: { achieved: false, targetDate: "2024-12-31", targetScore: 9.0 }
        //   },
        //   levelProgression: {
        //     currentLevel: "intermediate",
        //     nextLevel: "advanced",
        //     progressToNext: 76.5, // percentage
        //     estimatedPromotionDate: "2024-06-15"
        //   }
        // }
      },
    },
    { timestamps: true }
  );
};
