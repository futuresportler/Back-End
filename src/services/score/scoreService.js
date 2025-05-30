const scoreRepository = require("./repositories/scoreRepository");
const coachAnalyticsRepository = require("../coach/repositories/coachAnalyticsRepository");
const academyRepository = require("../academy/repositories/academyRepository");
const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../../database");

class ScoreService {
  // Student Score Management
  async updateStudentScore(
    studentId,
    studentType,
    scoreData,
    assessorId,
    assessorType = "coach"
  ) {
    try {
      // Validate score data
      this.validateScoreData(scoreData);

      // Get current month
      const currentMonth = await this.getCurrentMonth();

      // Prepare score data with metadata
      const enrichedScoreData = {
        ...scoreData,
        scoreMetrics: {
          ...scoreData.scoreMetrics,
          assessmentDate: new Date().toISOString(),
          assessedBy: assessorId,
          assessorType: assessorType,
          methodology: scoreData.methodology || "practical_assessment",
        },
      };

      // Update student scores
      await scoreRepository.updateStudentScores(
        studentId,
        studentType,
        enrichedScoreData,
        currentMonth.monthId
      );

      // Calculate and update batch/program metrics if applicable
      await this.updateEntityMetrics(
        studentId,
        studentType,
        currentMonth.monthId
      );

      return {
        success: true,
        message: "Student scores updated successfully",
        scoreData: enrichedScoreData,
      };
    } catch (error) {
      throw new Error(`Failed to update student score: ${error.message}`);
    }
  }

  async bulkUpdateScores(students, assessorId, assessorType = "coach") {
    const transaction = await sequelize.transaction();
    const results = [];

    try {
      for (const student of students) {
        const result = await this.updateStudentScore(
          student.studentId,
          student.studentType,
          student.scoreData,
          assessorId,
          assessorType
        );
        results.push({ studentId: student.studentId, ...result });
      }

      await transaction.commit();
      return {
        success: true,
        updated: results.length,
        results,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Score Analytics and Insights
  async getStudentScoreAnalytics(studentId, studentType, months = 6) {
    const scoreHistory = await scoreRepository.getStudentScoreHistory(
      studentId,
      studentType,
      months
    );

    return {
      history: scoreHistory,
      trends: this.calculateScoreTrends(scoreHistory),
      insights: this.generateStudentInsights(scoreHistory),
    };
  }

  async getBatchScoreAnalytics(batchId, monthId = null) {
    const currentMonth = monthId || (await this.getCurrentMonth()).monthId;

    const [batchMetrics, topPerformers, scoreDistribution] = await Promise.all([
      scoreRepository.getBatchScoreAnalytics(batchId, currentMonth),
      scoreRepository.getTopPerformers("batch", batchId, 10),
      scoreRepository.getScoreDistribution("batch", batchId),
    ]);

    return {
      metrics: batchMetrics,
      topPerformers,
      scoreDistribution: this.formatScoreDistribution(scoreDistribution),
      insights: this.generateBatchInsights(batchMetrics, scoreDistribution),
    };
  }

  async getProgramScoreAnalytics(programId, monthId = null) {
    const currentMonth = monthId || (await this.getCurrentMonth()).monthId;

    const [programMetrics, topPerformers, scoreDistribution] =
      await Promise.all([
        scoreRepository.updateProgramScoreMetrics(programId, currentMonth, {}),
        scoreRepository.getTopPerformers("program", programId, 10),
        scoreRepository.getScoreDistribution("program", programId),
      ]);

    return {
      metrics: programMetrics,
      topPerformers,
      scoreDistribution: this.formatScoreDistribution(scoreDistribution),
      insights: this.generateProgramInsights(programMetrics, scoreDistribution),
    };
  }

  async getCoachEffectivenessReport(coachId, monthId = null) {
    const currentMonth = monthId || (await this.getCurrentMonth()).monthId;

    // Update effectiveness metrics first
    await coachAnalyticsRepository.updateCoachEffectivenessMetrics(
      coachId,
      currentMonth
    );

    // Get comprehensive analytics
    const [effectiveness, batchComparison, topStudents, insights] =
      await Promise.all([
        coachAnalyticsRepository.getCoachScoreEffectiveness(
          coachId,
          currentMonth
        ),
        coachAnalyticsRepository.getBatchScoreComparison(coachId),
        coachAnalyticsRepository.getTopPerformingStudents(coachId, 10),
        coachAnalyticsRepository.getCoachingInsights(coachId, currentMonth),
      ]);

    return {
      effectiveness,
      batchComparison,
      topStudents,
      insights,
      recommendations: this.generateCoachRecommendations(insights),
    };
  }

  // Achievement System
  async awardAchievement(studentId, studentType, achievement) {
    const achievementData = {
      id: uuidv4(),
      type: achievement.type,
      name: achievement.name,
      description: achievement.description,
      earnedDate: new Date().toISOString(),
      sport: achievement.sport,
      level: achievement.level || "bronze",
    };

    if (studentType === "coach") {
      // Update CoachStudent achievement flags
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });

      if (coachStudent) {
        const updatedFlags = [
          ...(coachStudent.achievementFlags || []),
          achievement.type,
        ];
        await coachStudent.update({ achievementFlags: updatedFlags });
      }
    } else {
      // Update AcademyStudent achievement badges
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      if (academyStudent) {
        const updatedBadges = [
          ...(academyStudent.achievementBadges || []),
          achievementData,
        ];
        await academyStudent.update({ achievementBadges: updatedBadges });
      }
    }

    return achievementData;
  }

  async checkAndAwardAutoAchievements(studentId, studentType, newScores) {
    const achievements = [];

    // Check for score-based achievements
    if (newScores.overall >= 8.5) {
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: "excellence_badge",
          name: "Excellence Badge",
          description: "Achieved overall score of 8.5 or higher",
          sport: newScores.sport,
        })
      );
    }

    // Check for improvement achievements
    if (newScores.improvement && newScores.improvement > 2.0) {
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: "rapid_improvement",
          name: "Rapid Improvement",
          description: "Improved by more than 2 points",
          sport: newScores.sport,
        })
      );
    }

    // Check for consistency achievements
    if (newScores.consistency && newScores.consistency >= 3) {
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: "consistent_performer",
          name: "Consistent Performer",
          description: "Maintained high scores for 3+ months",
          sport: newScores.sport,
        })
      );
    }

    return achievements;
  }

  // ============ PROGRESS TRACKING INTEGRATION ============

  async getStudentProgressAnalytics(studentId, studentType, timeframe = 6) {
    const scoreAnalytics = await this.getStudentScoreAnalytics(
      studentId,
      studentType,
      timeframe
    );
    const progressData = await this._getProgressTrackingData(
      studentId,
      studentType,
      timeframe
    );

    return {
      scores: scoreAnalytics,
      progressTracking: progressData,
      integratedInsights: this._generateIntegratedInsights(
        scoreAnalytics,
        progressData
      ),
      recommendations: this._generateProgressBasedRecommendations(
        scoreAnalytics,
        progressData
      ),
    };
  }

  async getBatchProgressAnalytics(
    batchId,
    batchType = "academy",
    monthId = null
  ) {
    const currentMonth = monthId || (await this.getCurrentMonth()).monthId;

    const [scoreAnalytics, progressTracking] = await Promise.all([
      this.getBatchScoreAnalytics(batchId, currentMonth),
      this._getBatchProgressTracking(batchId, batchType, currentMonth),
    ]);

    return {
      scores: scoreAnalytics,
      progressTracking,
      correlationAnalysis: this._analyzeScoreProgressCorrelation(
        scoreAnalytics,
        progressTracking
      ),
      batchEffectiveness: this._calculateBatchEffectiveness(
        scoreAnalytics,
        progressTracking
      ),
    };
  }

  async getCoachProgressEffectiveness(coachId, timeframe = 3) {
    const effectivenessReport = await this.getCoachEffectivenessReport(coachId);
    const progressTrackingMetrics = await this._getCoachProgressMetrics(
      coachId,
      timeframe
    );

    return {
      scoreEffectiveness: effectivenessReport,
      progressEffectiveness: progressTrackingMetrics,
      combinedRating: this._calculateCombinedEffectiveness(
        effectivenessReport,
        progressTrackingMetrics
      ),
      improvementAreas: this._identifyImprovementAreas(
        effectivenessReport,
        progressTrackingMetrics
      ),
    };
  }

  async generateQuarterlyProgressReport(studentId, studentType, year, quarter) {
    const [scoreData, progressData, achievements, feedback] = await Promise.all(
      [
        this._getQuarterlyScoreData(studentId, studentType, year, quarter),
        this._getQuarterlyProgressData(studentId, studentType, year, quarter),
        this._getQuarterlyAchievements(studentId, studentType, year, quarter),
        this._getQuarterlyFeedback(studentId, studentType, year, quarter),
      ]
    );

    const report = {
      reportId: uuidv4(),
      studentId,
      studentType,
      quarter: `${year}-${quarter}`,
      generatedAt: new Date().toISOString(),

      summary: {
        overallImprovement: this._calculateOverallImprovement(
          scoreData,
          progressData
        ),
        goalsAchieved: this._countAchievedGoals(progressData),
        attendanceRate: progressData.attendance?.percentage || 0,
        consistencyScore: this._calculateConsistencyScore(scoreData),
      },

      scoreAnalysis: {
        initialScores: scoreData.initial,
        finalScores: scoreData.final,
        improvements: scoreData.improvements,
        trends: this._analyzeQuarterlyTrends(scoreData.history),
      },

      progressDetails: {
        skillDevelopment: progressData.skills || {},
        personalizedGoals: progressData.personalizedGoals || {},
        challenges: progressData.challenges || [],
        breakthroughs: progressData.breakthroughs || [],
      },

      achievements: achievements,
      feedback: feedback,

      nextQuarterPlan: {
        focusAreas: this._identifyFocusAreas(scoreData, progressData),
        suggestedGoals: this._suggestNextGoals(progressData),
        recommendedIntensity: this._recommendTrainingIntensity(
          scoreData,
          progressData
        ),
      },
    };

    // Store the report
    await this._storeQuarterlyReport(report);

    return report;
  }

  async trackStudentMilestones(studentId, studentType, sport) {
    const currentScores = await this._getCurrentStudentScores(
      studentId,
      studentType,
      sport
    );
    const progressData = await this._getProgressTrackingData(
      studentId,
      studentType,
      12
    );

    const milestones = {
      current: this._getCurrentMilestone(currentScores),
      next: this._getNextMilestone(currentScores),
      progressToNext: this._calculateMilestoneProgress(currentScores),
      estimatedAchievementDate: this._estimateMilestoneDate(
        currentScores,
        progressData
      ),
      milestoneHistory: this._getMilestoneHistory(progressData),
    };

    return milestones;
  }

  // ============ PRIVATE HELPER METHODS FOR PROGRESS INTEGRATION ============

  async _getProgressTrackingData(studentId, studentType, timeframe) {
    if (studentType === "coach") {
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });

      return {
        progressTracking: coachStudent?.progressTracking || {},
        coachingPlan: coachStudent?.coachingPlan || {},
        performanceMetrics: coachStudent?.performanceMetrics || {},
      };
    } else {
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      return {
        progressTracking: academyStudent?.progressTracking || {},
        quarterlyReports: academyStudent?.quarterlyReports || [],
        progressMilestones: academyStudent?.progressMilestones || {},
      };
    }
  }

  async _getBatchProgressTracking(batchId, batchType, monthId) {
    let students = [];

    if (batchType === "academy") {
      students = await sequelize.models.AcademyStudent.findAll({
        where: { batchId },
        attributes: ["studentId", "progressTracking", "currentScores"],
      });
    } else {
      students = await sequelize.models.CoachStudent.findAll({
        where: { batchId },
        attributes: [
          "userId",
          "progressTracking",
          "currentScores",
          "performanceMetrics",
        ],
      });
    }

    const progressMetrics = {
      totalStudents: students.length,
      studentsWithProgress: 0,
      averageEngagement: 0,
      commonChallenges: [],
      successPatterns: [],
    };

    students.forEach((student) => {
      const progress = student.progressTracking || {};
      const hasProgress = Object.keys(progress).length > 0;

      if (hasProgress) {
        progressMetrics.studentsWithProgress++;

        // Analyze engagement and patterns
        Object.values(progress).forEach((yearData) => {
          Object.values(yearData).forEach((quarterData) => {
            Object.values(quarterData).forEach((sportData) => {
              if (sportData.challenges) {
                progressMetrics.commonChallenges.push(...sportData.challenges);
              }
              if (sportData.breakthroughs) {
                progressMetrics.successPatterns.push(
                  ...sportData.breakthroughs
                );
              }
            });
          });
        });
      }
    });

    // Calculate engagement score
    if (progressMetrics.studentsWithProgress > 0) {
      progressMetrics.averageEngagement =
        (progressMetrics.studentsWithProgress / progressMetrics.totalStudents) *
        100;
    }

    // Identify most common challenges and patterns
    progressMetrics.commonChallenges = this._getTopItems(
      progressMetrics.commonChallenges,
      5
    );
    progressMetrics.successPatterns = this._getTopItems(
      progressMetrics.successPatterns,
      5
    );

    return progressMetrics;
  }

  async _getCoachProgressMetrics(coachId, timeframe) {
    const students = await sequelize.models.CoachStudent.findAll({
      where: { coachId },
      attributes: [
        "userId",
        "progressTracking",
        "performanceMetrics",
        "coachingPlan",
      ],
    });

    const metrics = {
      totalStudents: students.length,
      studentsWithPersonalizedPlans: 0,
      averageGoalAchievementRate: 0,
      coachingEffectiveness: {
        skillDevelopmentRate: 0,
        studentEngagement: 0,
        parentSatisfaction: 0,
        planAdaptability: 0,
      },
    };

    let totalGoalAchievements = 0;
    let totalGoals = 0;

    students.forEach((student) => {
      const progress = student.progressTracking || {};
      const plan = student.coachingPlan || {};
      const performance = student.performanceMetrics || {};

      if (Object.keys(plan).length > 0) {
        metrics.studentsWithPersonalizedPlans++;
      }

      // Calculate goal achievement rates
      Object.values(progress).forEach((yearData) => {
        Object.values(yearData).forEach((quarterData) => {
          Object.values(quarterData).forEach((sportData) => {
            if (sportData.personalizedGoals) {
              const achieved =
                sportData.personalizedGoals.achieved?.length || 0;
              const inProgress =
                sportData.personalizedGoals.inProgress?.length || 0;
              totalGoalAchievements += achieved;
              totalGoals += achieved + inProgress;
            }
          });
        });
      });

      // Analyze performance metrics
      if (performance.sessionsAnalytics) {
        metrics.coachingEffectiveness.studentEngagement +=
          performance.sessionsAnalytics.engagementLevel || 0;
      }

      if (performance.parentSatisfaction) {
        metrics.coachingEffectiveness.parentSatisfaction +=
          performance.parentSatisfaction.currentRating || 0;
      }
    });

    // Calculate averages
    if (totalGoals > 0) {
      metrics.averageGoalAchievementRate =
        (totalGoalAchievements / totalGoals) * 100;
    }

    if (students.length > 0) {
      metrics.coachingEffectiveness.studentEngagement /= students.length;
      metrics.coachingEffectiveness.parentSatisfaction /= students.length;
    }

    return metrics;
  }

  _generateIntegratedInsights(scoreAnalytics, progressData) {
    const insights = [];

    // Correlate score trends with progress tracking
    if (
      scoreAnalytics.trends.trend === "improving" &&
      progressData.progressTracking &&
      Object.keys(progressData.progressTracking).length > 0
    ) {
      insights.push(
        "Score improvements align well with documented progress tracking"
      );
    }

    // Analyze goal achievement vs score improvement
    const hasProgressGoals = this._hasAchievedGoals(
      progressData.progressTracking
    );
    if (hasProgressGoals && scoreAnalytics.trends.improvement > 1.0) {
      insights.push(
        "Strong correlation between goal achievement and score improvement"
      );
    }

    // Check for coaching plan effectiveness
    if (
      progressData.coachingPlan &&
      progressData.performanceMetrics?.sessionsAnalytics?.improvementVelocity >
        0.3
    ) {
      insights.push("Personalized coaching plan showing measurable impact");
    }

    return insights;
  }

  _generateProgressBasedRecommendations(scoreAnalytics, progressData) {
    const recommendations = [];

    // Score-based recommendations
    if (scoreAnalytics.trends.trend === "declining") {
      recommendations.push({
        type: "urgent",
        category: "performance",
        suggestion:
          "Review current training approach - declining score trend detected",
      });
    }

    // Progress tracking recommendations
    if (
      !progressData.progressTracking ||
      Object.keys(progressData.progressTracking).length === 0
    ) {
      recommendations.push({
        type: "improvement",
        category: "tracking",
        suggestion: "Implement detailed progress tracking for better insights",
      });
    }

    // Coaching plan recommendations
    if (
      progressData.coachingPlan &&
      progressData.coachingPlan.adaptations?.length > 3
    ) {
      recommendations.push({
        type: "review",
        category: "planning",
        suggestion:
          "Consider reviewing coaching plan - frequent adaptations may indicate misalignment",
      });
    }

    return recommendations;
  }

  _analyzeScoreProgressCorrelation(scoreAnalytics, progressTracking) {
    const correlation = {
      score: scoreAnalytics.metrics?.averageScore || 0,
      engagement: progressTracking.averageEngagement || 0,
      correlation: "low",
    };

    // Simple correlation analysis
    if (correlation.score > 7.5 && correlation.engagement > 70) {
      correlation.correlation = "high";
    } else if (correlation.score > 6.0 && correlation.engagement > 50) {
      correlation.correlation = "medium";
    }

    return correlation;
  }

  _calculateBatchEffectiveness(scoreAnalytics, progressTracking) {
    const scoreWeight = 0.6;
    const progressWeight = 0.4;

    const scoreEffectiveness =
      ((scoreAnalytics.metrics?.averageScore || 0) / 10) * 100;
    const progressEffectiveness = progressTracking.averageEngagement || 0;

    const overallEffectiveness =
      scoreEffectiveness * scoreWeight + progressEffectiveness * progressWeight;

    return {
      overall: Math.round(overallEffectiveness),
      scoreComponent: Math.round(scoreEffectiveness),
      progressComponent: Math.round(progressEffectiveness),
      rating: this._getEffectivenessRating(overallEffectiveness),
    };
  }

  _calculateCombinedEffectiveness(scoreReport, progressMetrics) {
    const scoreRating = scoreReport.effectiveness?.overall || 0;
    const progressRating = progressMetrics.averageGoalAchievementRate || 0;

    const combined = scoreRating * 0.7 + progressRating * 0.3;

    return {
      combined: Math.round(combined),
      scoreContribution: scoreRating,
      progressContribution: progressRating,
      interpretation: this._interpretCombinedRating(combined),
    };
  }

  _identifyImprovementAreas(scoreReport, progressMetrics) {
    const areas = [];

    if (scoreReport.effectiveness?.overall < 60) {
      areas.push({
        area: "score_methodology",
        priority: "high",
        description: "Score improvement methods need review",
      });
    }

    if (progressMetrics.averageGoalAchievementRate < 50) {
      areas.push({
        area: "goal_setting",
        priority: "high",
        description: "Goal achievement rate is below optimal",
      });
    }

    if (progressMetrics.coachingEffectiveness.studentEngagement < 7.0) {
      areas.push({
        area: "engagement",
        priority: "medium",
        description: "Student engagement could be improved",
      });
    }

    return areas;
  }

  async _getQuarterlyScoreData(studentId, studentType, year, quarter) {
    const scoreHistory = await scoreRepository.getStudentScoreHistory(
      studentId,
      studentType,
      3 // Get 3 months of data for the quarter
    );

    if (scoreHistory.length === 0) {
      return { initial: {}, final: {}, improvements: {}, history: [] };
    }

    const quarterData = scoreHistory.filter((score) => {
      const scoreDate = new Date(score.assessmentDate || score.createdAt);
      const scoreYear = scoreDate.getFullYear();
      const scoreQuarter = `Q${Math.ceil((scoreDate.getMonth() + 1) / 3)}`;
      return scoreYear.toString() === year && scoreQuarter === quarter;
    });

    if (quarterData.length === 0) {
      return { initial: {}, final: {}, improvements: {}, history: [] };
    }

    const initial = quarterData[quarterData.length - 1]; // Oldest in quarter
    const final = quarterData[0]; // Most recent in quarter

    return {
      initial: initial.sportScores || initial.currentScores || {},
      final: final.sportScores || final.currentScores || {},
      improvements: this._calculateScoreImprovements(initial, final),
      history: quarterData,
    };
  }

  async _getQuarterlyProgressData(studentId, studentType, year, quarter) {
    const progressData = await this._getProgressTrackingData(
      studentId,
      studentType,
      12
    );

    const quarterProgress =
      progressData.progressTracking?.[year]?.[quarter] || {};

    return {
      ...quarterProgress,
      attendance: quarterProgress.attendance || {},
      personalizedGoals: quarterProgress.personalizedGoals || {},
      challenges: quarterProgress.challenges || [],
      breakthroughs: quarterProgress.breakthroughs || [],
    };
  }

  async _getQuarterlyAchievements(studentId, studentType, year, quarter) {
    if (studentType === "coach") {
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });
      return coachStudent?.achievementFlags || [];
    } else {
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );
      const achievements = academyStudent?.achievementBadges || [];

      // Filter achievements by quarter
      return achievements.filter((achievement) => {
        const earnedDate = new Date(achievement.earnedDate);
        const achievementYear = earnedDate.getFullYear();
        const achievementQuarter = `Q${Math.ceil(
          (earnedDate.getMonth() + 1) / 3
        )}`;
        return (
          achievementYear.toString() === year && achievementQuarter === quarter
        );
      });
    }
  }

  async _getQuarterlyFeedback(studentId, studentType, year, quarter) {
    // This would integrate with the feedback service
    const feedbackRepository = require("../feedback/repositories/feedbackRepository");

    try {
      return await feedbackRepository.getQuarterlyProgressFeedback(
        studentType,
        studentId,
        year,
        quarter
      );
    } catch (error) {
      console.error("Error retrieving quarterly feedback:", error);
      return [];
    }
  }

  _calculateOverallImprovement(scoreData, progressData) {
    let improvements = [];

    // Score-based improvement
    Object.values(scoreData.improvements).forEach((improvement) => {
      if (typeof improvement === "number") {
        improvements.push(improvement);
      }
    });

    // Progress-based improvement
    Object.values(progressData).forEach((sportData) => {
      if (sportData.skills) {
        Object.values(sportData.skills).forEach((skill) => {
          if (skill.improvement) {
            improvements.push(skill.improvement);
          }
        });
      }
    });

    return improvements.length > 0
      ? improvements.reduce((a, b) => a + b, 0) / improvements.length
      : 0;
  }

  _countAchievedGoals(progressData) {
    let achievedCount = 0;

    Object.values(progressData).forEach((sportData) => {
      if (sportData.personalizedGoals?.achieved) {
        achievedCount += sportData.personalizedGoals.achieved.length;
      }
    });

    return achievedCount;
  }

  _calculateConsistencyScore(scoreData) {
    if (scoreData.history.length < 3) return 0;

    const scores = scoreData.history.map(
      (h) => h.sportScores?.overall?.score || h.averageScores?.overall || 0
    );

    return this.calculateConsistency(scores);
  }

  _analyzeQuarterlyTrends(scoreHistory) {
    return this.calculateScoreTrends(scoreHistory);
  }

  _identifyFocusAreas(scoreData, progressData) {
    const focusAreas = [];

    // Identify areas with lowest scores
    const scoreAreas = Object.entries(scoreData.final)
      .filter(([key, value]) => {
        const score =
          typeof value === "object" ? value.score || value.overall : value;
        return score < 6.0;
      })
      .map(([key]) => key);

    focusAreas.push(...scoreAreas);

    // Identify areas with ongoing challenges
    Object.values(progressData).forEach((sportData) => {
      if (sportData.challenges) {
        focusAreas.push(...sportData.challenges);
      }
    });

    return [...new Set(focusAreas)].slice(0, 5); // Return unique top 5
  }

  _suggestNextGoals(progressData) {
    const suggestions = [];

    Object.entries(progressData).forEach(([sport, sportData]) => {
      if (sportData.personalizedGoals?.inProgress) {
        suggestions.push(
          ...sportData.personalizedGoals.inProgress.map((goal) => ({
            sport,
            goal,
            priority: "continue",
          }))
        );
      }

      if (sportData.nextQuarterFocus) {
        suggestions.push(
          ...sportData.nextQuarterFocus.map((focus) => ({
            sport,
            goal: focus,
            priority: "new",
          }))
        );
      }
    });

    return suggestions.slice(0, 8); // Limit to 8 goals
  }

  _recommendTrainingIntensity(scoreData, progressData) {
    const improvements = Object.values(scoreData.improvements);
    const avgImprovement =
      improvements.length > 0
        ? improvements.reduce((a, b) => a + b, 0) / improvements.length
        : 0;

    if (avgImprovement > 1.5) {
      return "maintain"; // Current intensity is working well
    } else if (avgImprovement < 0.5) {
      return "increase"; // Need more intensive training
    } else {
      return "adjust"; // Fine-tune based on specific areas
    }
  }

  async _storeQuarterlyReport(report) {
    // Store the report in the appropriate table or service
    // Implementation depends on your storage strategy
    console.log(`Quarterly report generated for student ${report.studentId}`);
    return report;
  }

  // Helper Methods
  validateScoreData(scoreData) {
    if (!scoreData.sportScores && !scoreData.currentScores) {
      throw new Error(
        "Score data must include either sportScores or currentScores"
      );
    }

    // Validate score ranges (0-10)
    const validateScoreRange = (scores) => {
      for (const [key, value] of Object.entries(scores)) {
        if (typeof value === "object" && value.score !== undefined) {
          if (value.score < 0 || value.score > 10) {
            throw new Error(`Score for ${key} must be between 0 and 10`);
          }
        } else if (typeof value === "number") {
          if (value < 0 || value > 10) {
            throw new Error(`Score for ${key} must be between 0 and 10`);
          }
        }
      }
    };

    if (scoreData.sportScores) {
      Object.values(scoreData.sportScores).forEach((sportScore) => {
        if (sportScore.technique)
          validateScoreRange({ technique: sportScore.technique });
        if (sportScore.fitness)
          validateScoreRange({ fitness: sportScore.fitness });
        if (sportScore.teamwork)
          validateScoreRange({ teamwork: sportScore.teamwork });
        if (sportScore.overall)
          validateScoreRange({ overall: sportScore.overall });
      });
    }

    if (scoreData.currentScores) {
      validateScoreRange(scoreData.currentScores);
    }
  }

  async getCurrentMonth() {
    const now = new Date();
    const month = await sequelize.models.Month.findOne({
      where: {
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    if (!month) {
      throw new Error("Current month not found in database");
    }

    return month;
  }

  calculateScoreTrends(scoreHistory) {
    if (scoreHistory.length < 2) return { trend: "insufficient_data" };

    const scores = scoreHistory.map(
      (h) => h.sportScores?.overall?.score || h.averageScores?.overall || 0
    );
    const latestScore = scores[scores.length - 1];
    const previousScore = scores[scores.length - 2];

    let trend = "stable";
    const improvement = latestScore - previousScore;

    if (improvement > 0.5) trend = "improving";
    else if (improvement < -0.5) trend = "declining";

    return {
      trend,
      improvement,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      consistency: this.calculateConsistency(scores),
    };
  }

  calculateConsistency(scores) {
    if (scores.length < 3) return 0;

    const variance =
      scores.reduce((acc, score, index) => {
        if (index === 0) return 0;
        return acc + Math.abs(score - scores[index - 1]);
      }, 0) /
      (scores.length - 1);

    return Math.max(0, 10 - variance); // Higher consistency = lower variance
  }

  formatScoreDistribution(distribution) {
    const total = distribution.reduce(
      (sum, item) => sum + parseInt(item.count),
      0
    );

    return distribution.map((item) => ({
      range: item.score_range,
      count: parseInt(item.count),
      percentage:
        total > 0 ? ((parseInt(item.count) / total) * 100).toFixed(1) : 0,
    }));
  }

  generateStudentInsights(scoreHistory) {
    const trends = this.calculateScoreTrends(scoreHistory);
    const insights = [];

    if (trends.trend === "improving") {
      insights.push("Student shows consistent improvement over time");
    } else if (trends.trend === "declining") {
      insights.push("Student needs additional support and attention");
    }

    if (trends.consistency > 8) {
      insights.push("Student demonstrates excellent consistency");
    } else if (trends.consistency < 5) {
      insights.push(
        "Student performance varies significantly - focus on consistency"
      );
    }

    return insights;
  }

  generateBatchInsights(batchMetrics, scoreDistribution) {
    const insights = [];

    if (!batchMetrics) return insights;

    const excellentPercentage =
      scoreDistribution.find((d) => d.range === "excellent")?.percentage || 0;
    const needsWorkPercentage =
      scoreDistribution.find((d) => d.range === "needs_work")?.percentage || 0;

    if (excellentPercentage > 30) {
      insights.push("Batch shows strong overall performance");
    }

    if (needsWorkPercentage > 20) {
      insights.push("Consider additional support for struggling students");
    }

    return insights;
  }

  generateProgramInsights(programMetrics, scoreDistribution) {
    // Similar to batch insights but focused on program-specific metrics
    return this.generateBatchInsights(programMetrics, scoreDistribution);
  }

  generateCoachRecommendations(insights) {
    const recommendations = [];

    if (insights.improvementRate < 70) {
      recommendations.push({
        type: "methodology",
        priority: "high",
        suggestion:
          "Review teaching methodology to improve student engagement and outcomes",
      });
    }

    if (insights.improvementAreas.includes("fitness")) {
      recommendations.push({
        type: "curriculum",
        priority: "medium",
        suggestion:
          "Incorporate more fitness-focused drills and conditioning exercises",
      });
    }

    if (insights.strongestCategories.length > 0) {
      recommendations.push({
        type: "leverage",
        priority: "low",
        suggestion: `Leverage your strength in ${insights.strongestCategories.join(
          ", "
        )} to improve other areas`,
      });
    }

    return recommendations;
  }

  async updateEntityMetrics(studentId, studentType, monthId) {
    // Update batch or program metrics based on student's enrollment
    if (studentType === "coach") {
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
        include: ["batch"],
      });

      if (coachStudent?.batchId) {
        await this.updateBatchMetrics(coachStudent.batchId, monthId);
      }
    } else if (studentType === "academy") {
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      if (academyStudent?.batchId) {
        await this.updateBatchMetrics(academyStudent.batchId, monthId);
      }

      if (academyStudent?.programId) {
        await this.updateProgramMetrics(academyStudent.programId, monthId);
      }
    }
  }

  async updateBatchMetrics(batchId, monthId) {
    // Calculate aggregated batch metrics from all students
    const students = await scoreRepository.getTopPerformers(
      "batch",
      batchId,
      1000
    );

    if (students.length === 0) return;

    const totalScore = students.reduce((sum, student) => {
      const score =
        typeof student.currentScores === "object"
          ? student.currentScores.overall || 0
          : 0;
      return sum + score;
    }, 0);

    const averageScore = totalScore / students.length;

    const scoreDistribution = {
      excellent: students.filter((s) => (s.currentScores?.overall || 0) >= 8.5)
        .length,
      good: students.filter((s) => {
        const score = s.currentScores?.overall || 0;
        return score >= 7.0 && score < 8.5;
      }).length,
      average: students.filter((s) => {
        const score = s.currentScores?.overall || 0;
        return score >= 5.0 && score < 7.0;
      }).length,
      needsWork: students.filter((s) => (s.currentScores?.overall || 0) < 5.0)
        .length,
    };

    const batchScoreData = {
      batchScoreMetrics: {
        averageScore,
        scoreDistribution,
        totalStudents: students.length,
        lastUpdated: new Date().toISOString(),
      },
    };

    await scoreRepository.updateBatchScoreMetrics(
      batchId,
      monthId,
      batchScoreData
    );
  }

  async updateProgramMetrics(programId, monthId) {
    // Similar to batch metrics but for programs
    const students = await scoreRepository.getTopPerformers(
      "program",
      programId,
      1000
    );

    if (students.length === 0) return;

    const totalScore = students.reduce((sum, student) => {
      const score =
        typeof student.currentScores === "object"
          ? student.currentScores.overall || 0
          : 0;
      return sum + score;
    }, 0);

    const averageScore = totalScore / students.length;

    const programScoreData = {
      programScoreMetrics: {
        averageProgramScore: averageScore,
        totalStudents: students.length,
        lastUpdated: new Date().toISOString(),
      },
    };

    await scoreRepository.updateProgramScoreMetrics(
      programId,
      monthId,
      programScoreData
    );
  }
}

module.exports = new ScoreService();
