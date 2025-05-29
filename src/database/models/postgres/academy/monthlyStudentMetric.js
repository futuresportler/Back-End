//models/postgres/academy/monthlyStudentMetric.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "MonthlyStudentMetric",
    {
      metricId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      performance: DataTypes.JSON,
      feedback: DataTypes.ARRAY(DataTypes.JSON),
      feeStatus: DataTypes.STRING,
      attendanceSummary: DataTypes.JSON,
      programId: {
        type: DataTypes.UUID,
        references: {
          model: "AcademyPrograms", // Add proper reference
          key: "programId",
        },
      },
      batchId: {
        type: DataTypes.UUID,
        references: {
          model: "AcademyBatches", // Add proper reference
          key: "batchId",
        },
      },
      monthId: {
        type: DataTypes.UUID,
        references: {
          model: "Months", // Add proper reference
          key: "monthId",
        },
      },
      // Add score tracking to monthly metrics
      averageScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Average scores across all activities for the month",
        // Structure: {
        //   overall: 8.2,
        //   byCategory: {
        //     technique: 8.5,
        //     fitness: 7.0,
        //     teamwork: 9.0
        //   },
        //   bySport: {
        //     football: 8.2,
        //     basketball: 7.5
        //   }
        // }
      },
      scoreImprovements: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score improvements compared to previous month",
        // Structure: {
        //   overall: { previous: 7.5, current: 8.2, improvement: 0.7 },
        //   byCategory: {
        //     technique: { improvement: 0.8, trend: "improving" }
        //   }
        // }
      },
      achievementsEarned: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
        comment: "New achievements and flags earned this month",
      },
      quarterlyAggregation: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Academy student quarterly progress aggregation data",
        // Structure: {
        //   quarter: "2024-Q1",
        //   monthInQuarter: 2,
        //   quarterlyMetrics: {
        //     programProgress: {
        //       programId: "uuid",
        //       programName: "Youth Football Development",
        //       quarterStartLevel: "beginner",
        //       currentLevel: "intermediate",
        //       targetLevel: "intermediate",
        //       progressPercentage: 78.5
        //     },
        //     batchProgress: {
        //       batchId: "uuid",
        //       batchName: "Morning Football Batch",
        //       peerRanking: 5, // out of 20 students
        //       groupAverageScore: 7.2,
        //       studentScore: 8.1,
        //       relativePerformance: "above_average"
        //     },
        //     skillCompetencies: {
        //       mastered: ["basic_dribbling", "passing"],
        //       developing: ["shooting", "defending"],
        //       introduced: ["advanced_tactics"],
        //       targetForNext: ["competition_skills"]
        //     }
        //   },
        //   academyStandards: {
        //     meetsStandards: true,
        //     standardsScore: 8.1,
        //     benchmarkComparison: {
        //       ageGroup: "12-15",
        //       academyAverage: 7.5,
        //       nationalAverage: 6.8,
        //       performance: "above_academy_average"
        //     }
        //   }
        // }
      },
      progressReporting: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Progress reporting and parent communication data",
        // Structure: {
        //   parentReports: {
        //     lastSentDate: "2024-01-31",
        //     frequency: "monthly",
        //     nextScheduledDate: "2024-02-28",
        //     reportFormat: "detailed", // "summary", "detailed", "custom"
        //     deliveryMethod: "email_and_app"
        //   },
        //   communicationLog: [
        //     {
        //       date: "2024-01-31",
        //       type: "progress_report",
        //       sentTo: ["parent", "student"],
        //       status: "delivered",
        //       readStatus: "read"
        //     }
        //   ],
        //   parentFeedback: {
        //     satisfactionRating: 4.8,
        //     feedbackComments: "Very pleased with the detailed progress tracking",
        //     requestedAdjustments: [],
        //     nextMeetingDate: "2024-02-15"
        //   }
        // }
      },
    },
    { timestamps: false }
  );
};
