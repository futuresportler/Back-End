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
