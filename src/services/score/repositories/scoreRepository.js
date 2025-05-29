const {
  MonthlyStudentProgress,
  CoachStudent,
  AcademyStudent,
  MonthlyStudentMetric,
  BatchMonthlyMetric,
  MonthlyCoachMetric,
  ProgramMonthlyMetric,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

class ScoreRepository {
  // Student Score Management
  async updateStudentScores(studentId, studentType, scores, monthId) {
    const transaction = await sequelize.transaction();

    try {
      if (studentType === "coach") {
        // Update CoachStudent scores
        const coachStudent = await CoachStudent.findOne({
          where: { userId: studentId },
          transaction,
        });

        if (coachStudent) {
          await coachStudent.update(
            {
              currentScores: scores.currentScores,
              achievementFlags: scores.achievementFlags || [],
              scoreHistory: scores.scoreHistory || {},
            },
            { transaction }
          );
        }

        // Update MonthlyStudentProgress
        await this.updateMonthlyProgress(
          studentId,
          scores,
          monthId,
          transaction
        );
      } else if (studentType === "academy") {
        // Update AcademyStudent scores
        const academyStudent = await AcademyStudent.findByPk(studentId, {
          transaction,
        });

        if (academyStudent) {
          await academyStudent.update(
            {
              currentScores: scores.currentScores,
              achievementBadges: scores.achievementBadges || [],
              scoreTrends: scores.scoreTrends || {},
            },
            { transaction }
          );
        }

        // Update MonthlyStudentMetric
        await this.updateMonthlyStudentMetric(
          studentId,
          scores,
          monthId,
          transaction
        );
      }

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateMonthlyProgress(studentId, scores, monthId, transaction = null) {
    const [progress, created] = await MonthlyStudentProgress.findOrCreate({
      where: { userId: studentId, monthId },
      defaults: {
        sportScores: scores.sportScores || {},
        scoreFlags: scores.scoreFlags || [],
        scoreMetrics: scores.scoreMetrics || {},
      },
      transaction,
    });

    if (!created) {
      await progress.update(
        {
          sportScores: scores.sportScores || progress.sportScores,
          scoreFlags: [
            ...(progress.scoreFlags || []),
            ...(scores.scoreFlags || []),
          ],
          scoreMetrics: { ...progress.scoreMetrics, ...scores.scoreMetrics },
        },
        { transaction }
      );
    }

    return progress;
  }

  async updateMonthlyStudentMetric(
    studentId,
    scores,
    monthId,
    transaction = null
  ) {
    const [metric, created] = await MonthlyStudentMetric.findOrCreate({
      where: { studentId, monthId },
      defaults: {
        averageScores: scores.averageScores || {},
        scoreImprovements: scores.scoreImprovements || {},
        achievementsEarned: scores.achievementsEarned || [],
      },
      transaction,
    });

    if (!created) {
      await metric.update(
        {
          averageScores: scores.averageScores || metric.averageScores,
          scoreImprovements:
            scores.scoreImprovements || metric.scoreImprovements,
          achievementsEarned: [
            ...(metric.achievementsEarned || []),
            ...(scores.achievementsEarned || []),
          ],
        },
        { transaction }
      );
    }

    return metric;
  }

  // Batch Score Analytics
  async updateBatchScoreMetrics(batchId, monthId, scoreData) {
    const [metric, created] = await BatchMonthlyMetric.findOrCreate({
      where: { batchId, monthId },
      defaults: {
        batchScoreMetrics: scoreData.batchScoreMetrics || {},
        scoreImprovements: scoreData.scoreImprovements || {},
        achievementSummary: scoreData.achievementSummary || {},
      },
    });

    if (!created) {
      await metric.update({
        batchScoreMetrics:
          scoreData.batchScoreMetrics || metric.batchScoreMetrics,
        scoreImprovements:
          scoreData.scoreImprovements || metric.scoreImprovements,
        achievementSummary:
          scoreData.achievementSummary || metric.achievementSummary,
      });
    }

    return metric;
  }

  // Coach Performance Based on Student Scores
  async updateCoachEffectiveness(coachId, monthId, effectivenessData) {
    const [metric, created] = await MonthlyCoachMetric.findOrCreate({
      where: { coachId, monthId },
      defaults: {
        coachingEffectiveness: effectivenessData.coachingEffectiveness || {},
        scoreBasedInsights: effectivenessData.scoreBasedInsights || {},
        achievementsMilestones: effectivenessData.achievementsMilestones || {},
      },
    });

    if (!created) {
      await metric.update({
        coachingEffectiveness:
          effectivenessData.coachingEffectiveness ||
          metric.coachingEffectiveness,
        scoreBasedInsights:
          effectivenessData.scoreBasedInsights || metric.scoreBasedInsights,
        achievementsMilestones:
          effectivenessData.achievementsMilestones ||
          metric.achievementsMilestones,
      });
    }

    return metric;
  }

  // Program Score Analytics
  async updateProgramScoreMetrics(programId, monthId, scoreData) {
    const [metric, created] = await ProgramMonthlyMetric.findOrCreate({
      where: { programId, monthId },
      defaults: {
        programScoreMetrics: scoreData.programScoreMetrics || {},
        curriculumEffectiveness: scoreData.curriculumEffectiveness || {},
        graduationReadiness: scoreData.graduationReadiness || {},
      },
    });

    if (!created) {
      await metric.update({
        programScoreMetrics:
          scoreData.programScoreMetrics || metric.programScoreMetrics,
        curriculumEffectiveness:
          scoreData.curriculumEffectiveness || metric.curriculumEffectiveness,
        graduationReadiness:
          scoreData.graduationReadiness || metric.graduationReadiness,
      });
    }

    return metric;
  }

  // Retrieval Methods
  async getStudentScoreHistory(studentId, studentType, months = 6) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    if (studentType === "coach") {
      const progress = await MonthlyStudentProgress.findAll({
        where: {
          userId: studentId,
          createdAt: { [Op.gte]: cutoffDate },
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: sequelize.models.Month,
            as: "month",
            attributes: ["monthName", "year"],
          },
        ],
      });

      return progress;
    } else {
      const metrics = await MonthlyStudentMetric.findAll({
        where: {
          studentId,
          createdAt: { [Op.gte]: cutoffDate },
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: sequelize.models.Month,
            as: "month",
            attributes: ["monthName", "year"],
          },
        ],
      });

      return metrics;
    }
  }

  async getBatchScoreAnalytics(batchId, monthId) {
    return await BatchMonthlyMetric.findOne({
      where: { batchId, monthId },
      attributes: [
        "batchScoreMetrics",
        "scoreImprovements",
        "achievementSummary",
      ],
    });
  }

  async getCoachEffectivenessMetrics(coachId, monthId) {
    return await MonthlyCoachMetric.findOne({
      where: { coachId, monthId },
      attributes: [
        "coachingEffectiveness",
        "scoreBasedInsights",
        "achievementsMilestones",
      ],
    });
  }

  async getTopPerformers(entityType, entityId, limit = 10) {
    let query;

    if (entityType === "batch") {
      // Get students from CoachStudent table for batch
      query = `
        SELECT cs."userId", u."first_name", u."last_name", cs."currentScores"
        FROM "CoachStudents" cs
        JOIN "Users" u ON cs."userId" = u."userId"
        WHERE cs."batchId" = :entityId
        ORDER BY (cs."currentScores"->>'overall')::float DESC NULLS LAST
        LIMIT :limit
      `;
    } else if (entityType === "program") {
      // Get students from AcademyStudent table for program
      query = `
        SELECT "studentId", "name", "currentScores"
        FROM "AcademyStudents"
        WHERE "programId" = :entityId
        ORDER BY (("currentScores"->>'overall')::float) DESC NULLS LAST
        LIMIT :limit
      `;
    }

    const results = await sequelize.query(query, {
      replacements: { entityId, limit },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }

  async getScoreDistribution(entityType, entityId) {
    let query;

    if (entityType === "batch") {
      query = `
        SELECT 
          CASE 
            WHEN (cs."currentScores"->>'overall')::float >= 8.5 THEN 'excellent'
            WHEN (cs."currentScores"->>'overall')::float >= 7.0 THEN 'good'
            WHEN (cs."currentScores"->>'overall')::float >= 5.0 THEN 'average'
            ELSE 'needs_work'
          END as score_range,
          COUNT(*) as count
        FROM "CoachStudents" cs
        WHERE cs."batchId" = :entityId AND cs."currentScores" IS NOT NULL
        GROUP BY score_range
      `;
    } else if (entityType === "program") {
      query = `
        SELECT 
          CASE 
            WHEN ("currentScores"->>'overall')::float >= 8.5 THEN 'excellent'
            WHEN ("currentScores"->>'overall')::float >= 7.0 THEN 'good'
            WHEN ("currentScores"->>'overall')::float >= 5.0 THEN 'average'
            ELSE 'needs_work'
          END as score_range,
          COUNT(*) as count
        FROM "AcademyStudents"
        WHERE "programId" = :entityId AND "currentScores" IS NOT NULL
        GROUP BY score_range
      `;
    }

    const results = await sequelize.query(query, {
      replacements: { entityId },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  }
}

module.exports = new ScoreRepository();
