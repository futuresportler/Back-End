const { scoreService } = require("../../services/score");
const {
  SPORTS_SCORING_FLAGS,
  SCORE_RANGES,
  ACHIEVEMENT_LEVELS,
  SCORE_VALIDATION_RULES,
} = require("../../config/scoreConstants");

// --- ScoreController ---
class ScoreController {
  // Get sports and their scoring categories/flags
  async getSportsConfig(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          sports: SPORTS_SCORING_FLAGS,
          scoreRanges: SCORE_RANGES,
          achievementLevels: ACHIEVEMENT_LEVELS,
          validationRules: SCORE_VALIDATION_RULES,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch sports configuration",
        error: error.message,
      });
    }
  }

  // Get scoring flags for a specific sport
  async getSportFlags(req, res) {
    try {
      const { sport } = req.params;

      if (!SPORTS_SCORING_FLAGS[sport]) {
        return res.status(404).json({
          success: false,
          message: `Sport '${sport}' not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          sport,
          ...SPORTS_SCORING_FLAGS[sport],
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch sport flags",
        error: error.message,
      });
    }
  }

  // Update student score
  async updateStudentScore(req, res) {
    try {
      const { studentId } = req.params;
      const { studentType, scoreData, methodology } = req.body;
      const assessorId = req.user?.userId || req.supplier?.supplierId;
      const assessorType = req.user ? "user" : "supplier";

      if (!studentId || !studentType || !scoreData) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: studentId, studentType, scoreData",
        });
      }

      // Add methodology to score data
      const enrichedScoreData = {
        ...scoreData,
        methodology: methodology || "manual_assessment",
      };

      const result = await scoreService.updateStudentScore(
        studentId,
        studentType,
        enrichedScoreData,
        assessorId,
        assessorType
      );

      res.status(200).json({
        success: true,
        message: "Student score updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Bulk update student scores
  async bulkUpdateScores(req, res) {
    try {
      const { students } = req.body;
      const assessorId = req.user?.userId || req.supplier?.supplierId;
      const assessorType = req.user ? "user" : "supplier";

      if (!students || !Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          message: "Students array is required",
        });
      }

      const result = await scoreService.bulkUpdateScores(
        students,
        assessorId,
        assessorType
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated ${result.updated} student scores`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get student score analytics
  async getStudentScoreAnalytics(req, res) {
    try {
      const { studentId } = req.params;
      const { studentType, months = 6 } = req.query;

      if (!studentType) {
        return res.status(400).json({
          success: false,
          message: "studentType query parameter is required",
        });
      }

      const analytics = await scoreService.getStudentScoreAnalytics(
        studentId,
        studentType,
        parseInt(months)
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get batch score analytics
  async getBatchScoreAnalytics(req, res) {
    try {
      const { batchId } = req.params;
      const { monthId } = req.query;

      const analytics = await scoreService.getBatchScoreAnalytics(
        batchId,
        monthId
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get program score analytics
  async getProgramScoreAnalytics(req, res) {
    try {
      const { programId } = req.params;
      const { monthId } = req.query;

      const analytics = await scoreService.getProgramScoreAnalytics(
        programId,
        monthId
      );

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get coach effectiveness report
  async getCoachEffectivenessReport(req, res) {
    try {
      const { coachId } = req.params;
      const { monthId } = req.query;

      const report = await scoreService.getCoachEffectivenessReport(
        coachId,
        monthId
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Award achievement to student
  async awardAchievement(req, res) {
    try {
      const { studentId } = req.params;
      const { studentType, achievement } = req.body;

      if (!studentType || !achievement) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: studentType, achievement",
        });
      }

      const result = await scoreService.awardAchievement(
        studentId,
        studentType,
        achievement
      );

      res.status(200).json({
        success: true,
        message: "Achievement awarded successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get score distribution for entity
  async getScoreDistribution(req, res) {
    try {
      const { entityType, entityId } = req.params;

      if (!["batch", "program", "academy"].includes(entityType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entityType. Must be: batch, program, or academy",
        });
      }

      const { scoreRepository } = require("../../services/score");
      const distribution = await scoreRepository.getScoreDistribution(
        entityType,
        entityId
      );

      res.status(200).json({
        success: true,
        data: {
          entityType,
          entityId,
          distribution,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get top performers for entity
  async getTopPerformers(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const { limit = 10 } = req.query;

      if (!["batch", "program", "academy"].includes(entityType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid entityType. Must be: batch, program, or academy",
        });
      }

      const { scoreRepository } = require("../../services/score");
      const topPerformers = await scoreRepository.getTopPerformers(
        entityType,
        entityId,
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: {
          entityType,
          entityId,
          topPerformers,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// --- CoachScoreController ---
const coachService = require("../../services/coach/coachService");

class CoachScoreController {
  // Get coach's students with scores
  async getStudentsWithScores(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { includeScoreHistory, monthId } = req.query;

      const filters = {};
      if (includeScoreHistory === "true") filters.includeScoreHistory = true;
      if (monthId) filters.monthId = monthId;

      const students = await coachService.getStudentsWithScores(
        coachId,
        filters
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          students,
          total: students.length,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update student score by coach
  async updateStudentScore(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { studentId } = req.params;
      const scoreData = req.body;

      // Validate sport-specific flags if provided
      if (scoreData.sportScores) {
        for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
          if (!SPORTS_SCORING_FLAGS[sport]) {
            return res.status(400).json({
              success: false,
              message: `Invalid sport: ${sport}`,
            });
          }
        }
      }

      const result = await coachService.updateStudentScore(
        coachId,
        studentId,
        scoreData
      );

      res.status(200).json({
        success: true,
        message: "Student score updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get student score history
  async getStudentScoreHistory(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { studentId } = req.params;
      const { months = 6 } = req.query;

      const history = await coachService.getStudentScoreHistory(
        coachId,
        studentId,
        parseInt(months)
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          studentId,
          months: parseInt(months),
          ...history,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get batch score analytics for coach
  async getBatchScoreAnalytics(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { batchId } = req.params;

      const analytics = await coachService.getBatchScoreAnalytics(
        coachId,
        batchId
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          batchId,
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get coach effectiveness report
  async getEffectivenessReport(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { monthId } = req.query;

      const report = await coachService.getCoachEffectivenessReport(
        coachId,
        monthId
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          monthId,
          ...report,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Bulk update student scores
  async bulkUpdateStudentScores(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;
      const { students } = req.body;

      if (!students || !Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          message: "Students array is required",
        });
      }

      const result = await coachService.bulkUpdateStudentScores(
        coachId,
        students
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated scores for ${result.updated} students`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get coach's score summary
  async getCoachScoreSummary(req, res) {
    try {
      const coachId = req.coach?.coachId || req.params.coachId;

      // Get students with scores
      const students = await coachService.getStudentsWithScores(coachId);

      // Calculate summary statistics
      const studentsWithScores = students.filter(
        (s) => s.currentScores && typeof s.currentScores.overall === "number"
      );

      const totalScore = studentsWithScores.reduce(
        (sum, student) => sum + (student.currentScores.overall || 0),
        0
      );

      const averageScore =
        studentsWithScores.length > 0
          ? (totalScore / studentsWithScores.length).toFixed(2)
          : 0;

      const scoreDistribution = {
        excellent: studentsWithScores.filter(
          (s) => s.currentScores.overall >= 8.5
        ).length,
        good: studentsWithScores.filter(
          (s) => s.currentScores.overall >= 7.0 && s.currentScores.overall < 8.5
        ).length,
        average: studentsWithScores.filter(
          (s) => s.currentScores.overall >= 5.0 && s.currentScores.overall < 7.0
        ).length,
        needsWork: studentsWithScores.filter(
          (s) => s.currentScores.overall < 5.0
        ).length,
      };

      res.status(200).json({
        success: true,
        data: {
          coachId,
          totalStudents: students.length,
          studentsWithScores: studentsWithScores.length,
          averageScore: parseFloat(averageScore),
          scoreDistribution,
          topPerformers: studentsWithScores
            .sort(
              (a, b) =>
                (b.currentScores.overall || 0) - (a.currentScores.overall || 0)
            )
            .slice(0, 5)
            .map((student) => ({
              userId: student.userId,
              name: student.student
                ? `${student.student.first_name} ${student.student.last_name}`
                : "Unknown",
              score: student.currentScores.overall,
            })),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// --- AcademyScoreController ---
const academyService = require("../../services/academy/academyService");

class AcademyScoreController {
  // Get academy students with score analytics
  async getStudentsWithScores(req, res) {
    try {
      const { academyId } = req.params;
      const { includeScoreTrends, sport } = req.query;

      const filters = {};
      if (includeScoreTrends === "true") filters.includeScoreTrends = true;
      if (sport) filters.sport = sport;

      const students = await academyService.getStudentsWithScoreAnalytics(
        academyId,
        filters
      );

      res.status(200).json({
        success: true,
        data: {
          academyId,
          students,
          total: students.length,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update student score
  async updateStudentScore(req, res) {
    try {
      const { academyId, studentId } = req.params;
      const scoreData = req.body;
      const assessorId = req.supplier?.supplierId || req.user?.userId;

      // Validate sport-specific flags if provided
      if (scoreData.sportScores) {
        for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
          if (!SPORTS_SCORING_FLAGS[sport]) {
            return res.status(400).json({
              success: false,
              message: `Invalid sport: ${sport}`,
            });
          }
        }
      }

      const result = await academyService.updateStudentScore(
        academyId,
        studentId,
        scoreData,
        assessorId
      );

      res.status(200).json({
        success: true,
        message: "Student score updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get student score analytics
  async getStudentScoreAnalytics(req, res) {
    try {
      const { academyId, studentId } = req.params;
      const { months = 6 } = req.query;

      const analytics = await academyService.getStudentScoreAnalytics(
        academyId,
        studentId,
        parseInt(months)
      );

      res.status(200).json({
        success: true,
        data: {
          academyId,
          studentId,
          months: parseInt(months),
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get batch score analytics
  async getBatchScoreAnalytics(req, res) {
    try {
      const { academyId, batchId } = req.params;

      const analytics = await academyService.getBatchScoreAnalytics(
        academyId,
        batchId
      );

      res.status(200).json({
        success: true,
        data: {
          academyId,
          batchId,
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get program score analytics
  async getProgramScoreAnalytics(req, res) {
    try {
      const { academyId, programId } = req.params;

      const analytics = await academyService.getProgramScoreAnalytics(
        academyId,
        programId
      );

      res.status(200).json({
        success: true,
        data: {
          academyId,
          programId,
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Award achievement to student
  async awardStudentAchievement(req, res) {
    try {
      const { academyId, studentId } = req.params;
      const { achievement } = req.body;

      if (!achievement) {
        return res.status(400).json({
          success: false,
          message: "Achievement data is required",
        });
      }

      const result = await academyService.awardStudentAchievement(
        academyId,
        studentId,
        achievement
      );

      res.status(200).json({
        success: true,
        message: "Achievement awarded successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get academy score overview
  async getAcademyScoreOverview(req, res) {
    try {
      const { academyId } = req.params;

      const overview = await academyService.getAcademyScoreOverview(academyId);

      res.status(200).json({
        success: true,
        data: {
          academyId,
          ...overview,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Bulk update student scores
  async bulkUpdateStudentScores(req, res) {
    try {
      const { academyId } = req.params;
      const { students } = req.body;
      const assessorId = req.supplier?.supplierId || req.user?.userId;

      if (!students || !Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          message: "Students array is required",
        });
      }

      const result = await academyService.bulkUpdateStudentScores(
        academyId,
        students,
        assessorId
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated scores for ${result.updated} students`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get academy score trends
  async getScoreTrends(req, res) {
    try {
      const { academyId } = req.params;
      const { months = 6 } = req.query;

      const academyMetricsRepository = require("../../services/academy/repositories/academyMetricsRepository");
      const trends =
        await academyMetricsRepository.getScoreProgressionAnalytics(
          academyId,
          parseInt(months)
        );

      res.status(200).json({
        success: true,
        data: {
          academyId,
          months: parseInt(months),
          trends,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get academy score insights
  async getScoreInsights(req, res) {
    try {
      const { academyId } = req.params;

      // Get overview and trends
      const [overview, students] = await Promise.all([
        academyService.getAcademyScoreOverview(academyId),
        academyService.getStudentsWithScoreAnalytics(academyId, {
          includeScoreTrends: true,
        }),
      ]);

      // Generate insights
      const insights = {
        performanceInsights: overview.insights,
        improvementOpportunities: [],
        strengths: [],
        recommendations: [],
      };

      // Analyze score distribution
      if (overview.scoreDistribution.excellent > overview.totalStudents * 0.4) {
        insights.strengths.push("High percentage of excellent performers");
      }

      if (overview.scoreDistribution.needsWork > overview.totalStudents * 0.2) {
        insights.improvementOpportunities.push(
          "Significant number of students need additional support"
        );
        insights.recommendations.push(
          "Implement targeted improvement programs for struggling students"
        );
      }

      // Analyze trends from students with score trends
      const studentsWithTrends = students.filter(
        (s) => s.scoreTrends && Object.keys(s.scoreTrends).length > 0
      );

      if (studentsWithTrends.length > 0) {
        const improvingStudents = studentsWithTrends.filter((s) =>
          Object.values(s.scoreTrends).some(
            (trend) => trend.trend === "improving"
          )
        );

        if (improvingStudents.length > studentsWithTrends.length * 0.6) {
          insights.strengths.push(
            "Majority of students showing improvement trends"
          );
        }
      }

      res.status(200).json({
        success: true,
        data: {
          academyId,
          overview,
          insights,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// --- AcademyCoachScoreController ---
const academyCoachService = require("../../services/academy/academyCoachService");

class AcademyCoachScoreController {
  // Get academy coach's students with scores
  async getMyStudentsWithScores(req, res) {
    try {
      const { coachId } = req.params;
      const { sport } = req.query;

      const filters = {};
      if (sport) filters.sport = sport;

      const students = await academyCoachService.getMyStudentsWithScores(
        coachId,
        filters
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          students,
          total: students.length,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update student score by academy coach
  async updateStudentScore(req, res) {
    try {
      const { coachId, studentId } = req.params;
      const scoreData = req.body;

      // Validate sport-specific flags if provided
      if (scoreData.sportScores) {
        for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
          if (!SPORTS_SCORING_FLAGS[sport]) {
            return res.status(400).json({
              success: false,
              message: `Invalid sport: ${sport}`,
            });
          }
        }
      }

      const result = await academyCoachService.updateStudentScore(
        coachId,
        studentId,
        scoreData
      );

      res.status(200).json({
        success: true,
        message: "Student score updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Bulk update student scores
  async bulkUpdateStudentScores(req, res) {
    try {
      const { coachId } = req.params;
      const { students } = req.body;

      if (!students || !Array.isArray(students)) {
        return res.status(400).json({
          success: false,
          message: "Students array is required",
        });
      }

      const result = await academyCoachService.bulkUpdateStudentScores(
        coachId,
        students
      );

      res.status(200).json({
        success: true,
        message: `Successfully updated scores for ${result.updated} students`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get coach score effectiveness
  async getCoachScoreEffectiveness(req, res) {
    try {
      const { coachId } = req.params;
      const { monthId } = req.query;

      const effectiveness =
        await academyCoachService.getCoachScoreEffectiveness(coachId, monthId);

      res.status(200).json({
        success: true,
        data: {
          coachId,
          monthId,
          ...effectiveness,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get batch score analytics for academy coach
  async getBatchScoreAnalytics(req, res) {
    try {
      const { coachId, batchId } = req.params;

      const analytics = await academyCoachService.getBatchScoreAnalytics(
        coachId,
        batchId
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          batchId,
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get program score analytics for academy coach
  async getProgramScoreAnalytics(req, res) {
    try {
      const { coachId, programId } = req.params;

      const analytics = await academyCoachService.getProgramScoreAnalytics(
        coachId,
        programId
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          programId,
          ...analytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Award achievement to student
  async awardStudentAchievement(req, res) {
    try {
      const { coachId, studentId } = req.params;
      const { achievement } = req.body;

      if (!achievement) {
        return res.status(400).json({
          success: false,
          message: "Achievement data is required",
        });
      }

      const result = await academyCoachService.awardStudentAchievement(
        coachId,
        studentId,
        achievement
      );

      res.status(200).json({
        success: true,
        message: "Achievement awarded successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get coach's assigned batches and programs with score summaries
  async getAssignedEntitiesWithScores(req, res) {
    try {
      const { coachId } = req.params;

      // Get batches and programs
      const { batches, programs } =
        await academyCoachService.getCoachBatchesAndPrograms(coachId);

      // Get score analytics for each batch and program
      const batchAnalytics = await Promise.all(
        batches.map(async (batch) => {
          try {
            const analytics = await academyCoachService.getBatchScoreAnalytics(
              coachId,
              batch.batchId
            );
            return {
              ...batch.toJSON(),
              scoreAnalytics: analytics,
            };
          } catch (error) {
            return {
              ...batch.toJSON(),
              scoreAnalytics: null,
              error: error.message,
            };
          }
        })
      );

      const programAnalytics = await Promise.all(
        programs.map(async (program) => {
          try {
            const analytics =
              await academyCoachService.getProgramScoreAnalytics(
                coachId,
                program.programId
              );
            return {
              ...program.toJSON(),
              scoreAnalytics: analytics,
            };
          } catch (error) {
            return {
              ...program.toJSON(),
              scoreAnalytics: null,
              error: error.message,
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        data: {
          coachId,
          batches: batchAnalytics,
          programs: programAnalytics,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

// --- UserScoreController ---
const userService = require("../../services/user/userService");

class UserScoreController {
  // Get user scores
  async getUserScores(req, res) {
    try {
      const { userId } = req.params;
      const { includeHistory = false } = req.query;

      const scores = await userService.getUserScores(userId, { includeHistory: includeHistory === 'true' });

      res.status(200).json({
        success: true,
        data: scores
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user score
  async updateUserScore(req, res) {
    try {
      const { userId } = req.params;
      const scoreData = req.body;
      const assessorId = req.user?.userId || req.supplier?.supplierId;
      const assessorType = req.user ? "user" : "supplier";

      // Validate sport-specific flags if provided
      if (scoreData.sportScores) {
        for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
          if (!SPORTS_SCORING_FLAGS[sport]) {
            return res.status(400).json({
              success: false,
              message: `Invalid sport: ${sport}`
            });
          }
        }
      }

      const result = await userService.updateUserScore(userId, scoreData, assessorId, assessorType);

      res.status(200).json({
        success: true,
        message: "User score updated successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user score history
  async getUserScoreHistory(req, res) {
    try {
      const { userId } = req.params;
      const { months = 6 } = req.query;

      const history = await userService.getUserScoreHistory(userId, parseInt(months));

      res.status(200).json({
        success: true,
        data: {
          userId,
          months: parseInt(months),
          history
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user score analytics
  async getUserScoreAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { months = 6 } = req.query;

      const analytics = await userService.getUserScoreAnalytics(userId, parseInt(months));

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Award achievement to user
  async awardUserAchievement(req, res) {
    try {
      const { userId } = req.params;
      const { achievement } = req.body;

      if (!achievement) {
        return res.status(400).json({
          success: false,
          message: "Achievement data is required"
        });
      }

      const result = await userService.awardUserAchievement(userId, achievement);

      res.status(200).json({
        success: true,
        message: "Achievement awarded successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user progress tracking
  async getUserProgressTracking(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = 6 } = req.query;

      const progressData = await userService.getUserProgressTracking(userId, parseInt(timeframe));

      res.status(200).json({
        success: true,
        data: progressData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user progress tracking
  async updateUserProgressTracking(req, res) {
    try {
      const { userId } = req.params;
      const { progressData } = req.body;
      const assessorId = req.user?.userId || req.supplier?.supplierId;
      const assessorType = req.user ? "user" : "supplier";

      if (!progressData) {
        return res.status(400).json({
          success: false,
          message: "Progress data is required"
        });
      }

      const result = await userService.updateUserProgressTracking(userId, progressData, assessorId, assessorType);

      res.status(200).json({
        success: true,
        message: "User progress tracking updated successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Generate user progress report
  async generateUserProgressReport(req, res) {
    try {
      const { userId } = req.params;
      const { year, quarter } = req.query;

      if (!year || !quarter) {
        return res.status(400).json({
          success: false,
          message: "Year and quarter are required query parameters"
        });
      }

      const report = await userService.generateUserProgressReport(userId, year, quarter);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Track user milestones
  async trackUserMilestones(req, res) {
    try {
      const { userId } = req.params;
      const { sport } = req.query;

      if (!sport) {
        return res.status(400).json({
          success: false,
          message: "Sport query parameter is required"
        });
      }

      const milestones = await userService.trackUserMilestones(userId, sport);

      res.status(200).json({
        success: true,
        data: milestones
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}
// Export all controllers as properties of an object
module.exports = {
  ScoreController: new ScoreController(),
  CoachScoreController: new CoachScoreController(),
  AcademyScoreController: new AcademyScoreController(),
  AcademyCoachScoreController: new AcademyCoachScoreController(),
  UserScoreController: new UserScoreController(),
};
