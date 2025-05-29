const feedbackRepository = require("./repositories/feedbackRepository");
const { v4: uuidv4 } = require("uuid");

class FeedbackService {
  // ============ UNIVERSAL ENTITY METHODS ============

  async getEntityFeedback(entityType, entityId, filters = {}) {
    try {
      switch (entityType) {
        case "academy":
          return await feedbackRepository.getAcademyFeedback(entityId, filters);
        case "coach":
          return await feedbackRepository.getCoachFeedback(entityId, filters);
        case "student":
          return await feedbackRepository.getStudentFeedback(entityId, filters);
        case "batch":
          const batchType = filters.batchType || "academy";
          return await feedbackRepository.getBatchFeedback(
            entityId,
            batchType,
            filters
          );
        case "program":
          return await feedbackRepository.getProgramFeedback(entityId, filters);
        case "session":
          return await feedbackRepository.getSessionFeedback(entityId, filters);
        default:
          throw new Error("Invalid entity type");
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch ${entityType} feedback: ${error.message}`
      );
    }
  }

  async createEntityFeedback(entityType, entityId, feedbackData, userId) {
    try {
      // Enhance feedback data with progress tracking if applicable
      if (feedbackData.includesProgressQuestions) {
        feedbackData.progressTrackingEnabled = true;
        feedbackData.progressSubmissionDate = new Date().toISOString();
      }

      switch (entityType) {
        case "academy":
          return await this._createAcademyFeedback(
            entityId,
            feedbackData,
            userId
          );
        case "coach":
          return await this._createCoachFeedback(
            entityId,
            feedbackData,
            userId
          );
        case "student":
          return await this._createStudentFeedback(
            entityId,
            feedbackData,
            userId
          );
        case "batch":
          return await this._createBatchFeedback(
            entityId,
            feedbackData,
            userId
          );
        case "program":
          return await this._createProgramFeedback(
            entityId,
            feedbackData,
            userId
          );
        case "session":
          return await this._createSessionFeedback(
            entityId,
            feedbackData,
            userId
          );
        default:
          throw new Error("Invalid entity type");
      }
    } catch (error) {
      throw new Error(
        `Failed to create ${entityType} feedback: ${error.message}`
      );
    }
  }

  // ============ HIERARCHICAL FEEDBACK METHODS ============

  async getAcademyCoachFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyCoachFeedback(
        academyId,
        filters
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch academy coach feedback: ${error.message}`
      );
    }
  }

  async getAcademyStudentFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyStudentFeedback(
        academyId,
        filters
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch academy student feedback: ${error.message}`
      );
    }
  }

  async getAcademyBatchFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyBatchFeedback(
        academyId,
        filters
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch academy batch feedback: ${error.message}`
      );
    }
  }

  async getAcademyProgramFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyProgramFeedback(
        academyId,
        filters
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch academy program feedback: ${error.message}`
      );
    }
  }

  async getCoachStudentFeedback(coachId, filters = {}) {
    try {
      return await feedbackRepository.getCoachStudentFeedback(coachId, filters);
    } catch (error) {
      throw new Error(
        `Failed to fetch coach student feedback: ${error.message}`
      );
    }
  }

  async getCoachBatchFeedback(coachId, filters = {}) {
    try {
      return await feedbackRepository.getCoachBatchFeedback(coachId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch coach batch feedback: ${error.message}`);
    }
  }

  // ============ ANALYTICS METHODS ============

  async getFeedbackAnalytics(entityType, entityId) {
    try {
      return await feedbackRepository.getFeedbackAnalytics(
        entityType,
        entityId
      );
    } catch (error) {
      throw new Error(`Failed to fetch feedback analytics: ${error.message}`);
    }
  }

  async getRecentFeedback(entityType, entityId, limit = 5) {
    try {
      const filters = { limit };
      return await this.getEntityFeedback(entityType, entityId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch recent feedback: ${error.message}`);
    }
  }

  // ============ PROGRESS TRACKING FEEDBACK METHODS ============

  async createProgressTrackingFeedback(
    entityType,
    entityId,
    progressFeedbackData,
    userId
  ) {
    try {
      const feedback = {
        ...progressFeedbackData,
        feedbackType: "progress_tracking",
        includesProgressQuestions: true,
        progressMetrics: {
          skillDevelopment: progressFeedbackData.skillDevelopment || {},
          goalAchievement: progressFeedbackData.goalAchievement || {},
          improvementAreas: progressFeedbackData.improvementAreas || [],
          strengthAreas: progressFeedbackData.strengthAreas || [],
          quarterlyRating: progressFeedbackData.quarterlyRating || 0,
          parentSatisfaction: progressFeedbackData.parentSatisfaction || {},
          coachingEffectiveness:
            progressFeedbackData.coachingEffectiveness || {},
        },
        submittedAt: new Date().toISOString(),
      };

      return await this.createEntityFeedback(
        entityType,
        entityId,
        feedback,
        userId
      );
    } catch (error) {
      throw new Error(
        `Failed to create progress tracking feedback: ${error.message}`
      );
    }
  }

  async getQuarterlyProgressFeedback(
    entityType,
    entityId,
    year,
    quarter,
    filters = {}
  ) {
    try {
      const feedbackFilters = {
        ...filters,
        feedbackType: "progress_tracking",
        timeRange: {
          year,
          quarter,
        },
      };

      const feedback = await this.getEntityFeedback(
        entityType,
        entityId,
        feedbackFilters
      );

      // Process and categorize the feedback
      const categorizedFeedback = {
        studentFeedback: [],
        parentFeedback: [],
        coachFeedback: [],
        summary: {
          totalResponses: feedback.length,
          averageRating: 0,
          commonThemes: [],
          improvementSuggestions: [],
        },
      };

      let totalRating = 0;
      const themes = {};
      const suggestions = [];

      feedback.forEach((item) => {
        const category = item.feedbackCategory || "student";
        categorizedFeedback[`${category}Feedback`]?.push(item);

        if (item.progressMetrics?.quarterlyRating) {
          totalRating += item.progressMetrics.quarterlyRating;
        }

        // Extract themes from improvement areas and strength areas
        if (item.progressMetrics?.improvementAreas) {
          item.progressMetrics.improvementAreas.forEach((area) => {
            themes[area] = (themes[area] || 0) + 1;
          });
        }

        if (item.progressMetrics?.strengthAreas) {
          item.progressMetrics.strengthAreas.forEach((area) => {
            themes[area] = (themes[area] || 0) + 1;
          });
        }

        // Collect suggestions
        if (item.suggestions) {
          suggestions.push(item.suggestions);
        }
      });

      // Calculate summary metrics
      if (feedback.length > 0) {
        categorizedFeedback.summary.averageRating =
          totalRating / feedback.length;
      }

      categorizedFeedback.summary.commonThemes = Object.entries(themes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, mentions: count }));

      categorizedFeedback.summary.improvementSuggestions = suggestions.slice(
        0,
        10
      );

      return categorizedFeedback;
    } catch (error) {
      throw new Error(
        `Failed to get quarterly progress feedback: ${error.message}`
      );
    }
  }

  async generateProgressFeedbackPrompts(entityType, entityId, progressData) {
    try {
      // Generate contextual feedback questions based on progress data
      const prompts = {
        skillDevelopmentQuestions: [],
        goalAchievementQuestions: [],
        generalProgressQuestions: [],
        parentQuestions: [],
        coachQuestions: [],
      };

      // Skill development questions based on progress
      if (progressData.skills) {
        Object.entries(progressData.skills).forEach(([skill, data]) => {
          if (data.improvement > 1.0) {
            prompts.skillDevelopmentQuestions.push({
              question: `How satisfied are you with the improvement in ${skill}?`,
              context: `${skill} improved by ${data.improvement} points`,
              type: "rating",
              scale: "1-10",
            });
          } else if (data.improvement < 0.5) {
            prompts.skillDevelopmentQuestions.push({
              question: `What challenges are you facing with ${skill} development?`,
              context: `${skill} shows slower progress`,
              type: "text",
              suggestions: [
                "Need more practice time",
                "Technique needs adjustment",
                "Motivation issues",
                "External factors",
              ],
            });
          }
        });
      }

      // Goal achievement questions
      if (progressData.personalizedGoals) {
        if (progressData.personalizedGoals.achieved?.length > 0) {
          prompts.goalAchievementQuestions.push({
            question: "Which achieved goals are you most proud of?",
            context: `Goals achieved: ${progressData.personalizedGoals.achieved.join(
              ", "
            )}`,
            type: "multiple_choice",
            options: progressData.personalizedGoals.achieved,
          });
        }

        if (progressData.personalizedGoals.inProgress?.length > 0) {
          prompts.goalAchievementQuestions.push({
            question:
              "What support do you need to achieve your remaining goals?",
            context: `Goals in progress: ${progressData.personalizedGoals.inProgress.join(
              ", "
            )}`,
            type: "text",
          });
        }
      }

      // General progress questions
      prompts.generalProgressQuestions.push(
        {
          question: "How would you rate your overall progress this quarter?",
          type: "rating",
          scale: "1-10",
        },
        {
          question: "What aspect of your training do you enjoy most?",
          type: "text",
        },
        {
          question: "What would you like to focus on next quarter?",
          type: "text",
        }
      );

      // Parent-specific questions
      prompts.parentQuestions.push(
        {
          question: "How satisfied are you with your child's progress?",
          type: "rating",
          scale: "1-10",
        },
        {
          question: "Have you noticed improvements in your child's confidence?",
          type: "yes_no_explain",
        },
        {
          question:
            "How would you rate the communication about your child's progress?",
          type: "rating",
          scale: "1-10",
        },
        {
          question: "Any concerns or suggestions for improvement?",
          type: "text",
        }
      );

      // Coach-specific questions (for coach effectiveness)
      prompts.coachQuestions.push(
        {
          question: "How effective do you find the current coaching approach?",
          type: "rating",
          scale: "1-10",
        },
        {
          question: "What coaching methods work best for this student?",
          type: "multiple_choice",
          options: [
            "Demonstration",
            "Verbal instruction",
            "Hands-on guidance",
            "Game-based learning",
            "Individual attention",
          ],
        },
        {
          question: "What areas should the coach focus on more?",
          type: "text",
        }
      );

      return prompts;
    } catch (error) {
      throw new Error(
        `Failed to generate progress feedback prompts: ${error.message}`
      );
    }
  }

  async analyzeProgressFeedbackTrends(entityType, entityId, timeframe = 6) {
    try {
      // Get feedback over specified timeframe (months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - timeframe);

      const feedback = await this.getEntityFeedback(entityType, entityId, {
        feedbackType: "progress_tracking",
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      const trends = {
        ratingTrend: [],
        skillProgressTrend: {},
        satisfactionTrend: [],
        commonIssues: {},
        improvementSuggestions: {},
        overallTrend: "stable", // 'improving', 'declining', 'stable'
      };

      // Group feedback by month
      const feedbackByMonth = {};
      feedback.forEach((item) => {
        const month = new Date(item.createdAt).toISOString().substring(0, 7); // YYYY-MM
        if (!feedbackByMonth[month]) {
          feedbackByMonth[month] = [];
        }
        feedbackByMonth[month].push(item);
      });

      // Analyze trends month by month
      Object.entries(feedbackByMonth).forEach(([month, monthlyFeedback]) => {
        let totalRating = 0;
        let ratingCount = 0;
        const skillRatings = {};

        monthlyFeedback.forEach((item) => {
          if (item.progressMetrics?.quarterlyRating) {
            totalRating += item.progressMetrics.quarterlyRating;
            ratingCount++;
          }

          // Track skill development ratings
          if (item.progressMetrics?.skillDevelopment) {
            Object.entries(item.progressMetrics.skillDevelopment).forEach(
              ([skill, rating]) => {
                if (!skillRatings[skill]) {
                  skillRatings[skill] = { total: 0, count: 0 };
                }
                skillRatings[skill].total += rating;
                skillRatings[skill].count++;
              }
            );
          }
        });

        // Add monthly data to trends
        if (ratingCount > 0) {
          trends.ratingTrend.push({
            month,
            averageRating: totalRating / ratingCount,
            responseCount: ratingCount,
          });
        }

        // Add skill progress trends
        Object.entries(skillRatings).forEach(([skill, data]) => {
          if (!trends.skillProgressTrend[skill]) {
            trends.skillProgressTrend[skill] = [];
          }
          trends.skillProgressTrend[skill].push({
            month,
            averageRating: data.total / data.count,
          });
        });
      });

      // Determine overall trend
      if (trends.ratingTrend.length >= 2) {
        const firstRating = trends.ratingTrend[0].averageRating;
        const lastRating =
          trends.ratingTrend[trends.ratingTrend.length - 1].averageRating;
        const difference = lastRating - firstRating;

        if (difference > 0.5) {
          trends.overallTrend = "improving";
        } else if (difference < -0.5) {
          trends.overallTrend = "declining";
        } else {
          trends.overallTrend = "stable";
        }
      }

      return trends;
    } catch (error) {
      throw new Error(
        `Failed to analyze progress feedback trends: ${error.message}`
      );
    }
  }

  // ============ PRIVATE CREATE METHODS ============

  async _createAcademyFeedback(academyId, feedbackData, userId) {
    const feedback = {
      reviewId: uuidv4(),
      academyId,
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      verifiedPurchase: feedbackData.verifiedPurchase || false,
    };
    return await feedbackRepository.createAcademyFeedback(feedback);
  }

  async _createCoachFeedback(coachId, feedbackData, userId) {
    const feedback = {
      reviewId: uuidv4(),
      coachId,
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      verifiedPurchase: feedbackData.verifiedPurchase || false,
      isPublic:
        feedbackData.isPublic !== undefined ? feedbackData.isPublic : true,
    };
    return await feedbackRepository.createCoachFeedback(feedback);
  }

  async _createStudentFeedback(studentId, feedbackData, userId) {
    const feedback = {
      studentId,
      academyId: feedbackData.academyId,
      coachId: feedbackData.coachId,
      feedback: {
        feedbackId: uuidv4(),
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        feedbackType: feedbackData.feedbackType || "general",
        userId,
      },
    };
    return await feedbackRepository.createStudentFeedback(feedback);
  }

  async _createBatchFeedback(batchId, feedbackData, userId) {
    const feedback = {
      feedbackId: uuidv4(),
      batchId,
      batchType: feedbackData.batchType || "academy",
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      feedbackAspects: feedbackData.feedbackAspects || {},
    };
    return await feedbackRepository.createBatchFeedback(feedback);
  }

  async _createProgramFeedback(programId, feedbackData, userId) {
    const feedback = {
      feedbackId: uuidv4(),
      programId,
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      programAspects: feedbackData.programAspects || {},
      completionStatus: feedbackData.completionStatus || "ongoing",
    };
    return await feedbackRepository.createProgramFeedback(feedback);
  }

  async _createSessionFeedback(sessionId, feedbackData, userId) {
    const feedback = {
      feedbackId: uuidv4(),
      sessionId,
      entityType: feedbackData.entityType,
      entityId: feedbackData.entityId,
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      feedbackType: feedbackData.feedbackType || "student_to_session",
      isPublic:
        feedbackData.isPublic !== undefined ? feedbackData.isPublic : true,
    };
    return await feedbackRepository.createSessionFeedback(feedback);
  }
}

module.exports = new FeedbackService();
