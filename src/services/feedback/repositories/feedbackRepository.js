const {
  AcademyReview,
  CoachReview,
  TurfReview,
  AcademyStudent,
  CoachStudent,
  AcademyBatch,
  CoachBatch,
  AcademyProgram,
  SessionFeedback,
  BatchFeedback,
  ProgramFeedback,
  MonthlyStudentProgress,
  User,
  AcademyProfile,
  CoachProfile,
  TurfProfile,
  Month,
  sequelize,
} = require("../../../database");

class FeedbackRepository {
  // ============ CORE ENTITY FEEDBACK METHODS ============

  async getAcademyFeedback(academyId, filters = {}) {
    const where = { academyId };
    this._applyCommonFilters(where, filters);

    return await AcademyReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name", "email"],
        },
        {
          model: AcademyProfile,
          as: "academy",
          attributes: ["academyId", "academy_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getCoachFeedback(coachId, filters = {}) {
    const where = { coachId };
    this._applyCommonFilters(where, filters);

    if (filters.verified !== undefined) {
      where.verifiedPurchase = filters.verified;
    }

    return await CoachReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
        {
          model: CoachProfile,
          as: "coach",
          attributes: ["coachId", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getStudentFeedback(studentId, filters = {}) {
    const [academyFeedback, coachFeedback, monthlyProgress] = await Promise.all([
      this._getAcademyStudentFeedback(studentId),
      this._getCoachStudentFeedback(studentId),
      this._getMonthlyProgress(studentId),
    ]);

    return {
      academyFeedback,
      coachFeedback,
      monthlyProgress,
    };
  }

  async getBatchFeedback(batchId, batchType, filters = {}) {
    const where = { batchId, batchType };
    this._applyCommonFilters(where, filters);

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getProgramFeedback(programId, filters = {}) {
    const where = { programId };
    this._applyCommonFilters(where, filters);

    if (filters.completionStatus) {
      where.completionStatus = filters.completionStatus;
    }

    return await ProgramFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
        {
          model: AcademyProgram,
          as: "program",
          attributes: ["programId", "programName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getSessionFeedback(sessionId, filters = {}) {
    const where = { sessionId };

    if (filters.feedbackType) {
      where.feedbackType = filters.feedbackType;
    }

    return await SessionFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  // ============ HIERARCHICAL FEEDBACK METHODS ============

  async getAcademyCoachFeedback(academyId, filters = {}) {
    const coaches = await this._getAcademyCoaches(academyId);
    const coachIds = coaches.map((c) => c.coachId);

    if (coachIds.length === 0) return [];

    const where = {
      coachId: { [sequelize.Op.in]: coachIds },
      isPublic: true,
    };
    this._applyCommonFilters(where, filters);

    return await CoachReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
        {
          model: CoachProfile,
          as: "coach",
          attributes: ["coachId", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getAcademyStudentFeedback(academyId, filters = {}) {
    const where = { academyId };

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    const students = await AcademyStudent.findAll({
      where,
      attributes: ["studentId", "name", "coachFeedback", "createdAt"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });

    return students.map((student) => ({
      ...student.toJSON(),
      feedbacks: student.coachFeedback || [],
    }));
  }

  async getAcademyBatchFeedback(academyId, filters = {}) {
    const batches = await AcademyBatch.findAll({
      where: { academyId },
      attributes: ["batchId", "batchName"],
    });

    const batchIds = batches.map((b) => b.batchId);
    if (batchIds.length === 0) return [];

    const where = {
      batchId: { [sequelize.Op.in]: batchIds },
      batchType: "academy",
    };
    this._applyCommonFilters(where, filters);

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getAcademyProgramFeedback(academyId, filters = {}) {
    const programs = await AcademyProgram.findAll({
      where: { academyId },
      attributes: ["programId", "programName"],
    });

    const programIds = programs.map((p) => p.programId);
    if (programIds.length === 0) return [];

    const where = {
      programId: { [sequelize.Op.in]: programIds },
    };
    this._applyCommonFilters(where, filters);

    return await ProgramFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
        {
          model: AcademyProgram,
          as: "program",
          attributes: ["programId", "programName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  async getCoachStudentFeedback(coachId, filters = {}) {
    const where = { coachId };

    if (filters.studentId) {
      where.userId = filters.studentId;
    }

    const students = await CoachStudent.findAll({
      where,
      attributes: ["id", "name", "coachFeedback", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });

    return students.map((student) => ({
      ...student.toJSON(),
      feedbacks: student.coachFeedback || [],
    }));
  }

  async getCoachBatchFeedback(coachId, filters = {}) {
    const batches = await CoachBatch.findAll({
      where: { coachId },
      attributes: ["batchId", "name"],
    });

    const batchIds = batches.map((b) => b.batchId);
    if (batchIds.length === 0) return [];

    const where = {
      batchId: { [sequelize.Op.in]: batchIds },
      batchType: "coach",
    };

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: this._getLimit(filters),
    });
  }

  // ============ CREATE FEEDBACK METHODS ============

  async createAcademyFeedback(feedbackData) {
    return await AcademyReview.create(feedbackData);
  }

  async createCoachFeedback(feedbackData) {
    return await CoachReview.create(feedbackData);
  }

  async createStudentFeedback(feedbackData) {
    const { studentId, academyId, coachId, feedback } = feedbackData;

    if (academyId) {
      return await this._updateAcademyStudentFeedback(studentId, academyId, feedback);
    }

    if (coachId) {
      return await this._updateCoachStudentFeedback(studentId, coachId, feedback);
    }

    throw new Error("Student not found");
  }

  async createBatchFeedback(feedbackData) {
    return await BatchFeedback.create(feedbackData);
  }

  async createProgramFeedback(feedbackData) {
    return await ProgramFeedback.create(feedbackData);
  }

  async createSessionFeedback(feedbackData) {
    return await SessionFeedback.create(feedbackData);
  }

  // ============ ANALYTICS METHODS ============

  async getFeedbackAnalytics(entityType, entityId) {
    const modelConfig = this._getModelConfig(entityType, entityId);
    
    const [analytics] = await sequelize.query(
      `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating::numeric) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM "${modelConfig.tableName}"
      WHERE ${Object.keys(modelConfig.whereClause)
        .map((key) => `"${key}" = :${key}`)
        .join(" AND ")}
    `,
      {
        replacements: modelConfig.whereClause,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return {
      totalReviews: parseInt(analytics.total_reviews),
      averageRating: parseFloat(analytics.average_rating || 0).toFixed(2),
      ratingDistribution: {
        5: parseInt(analytics.five_star),
        4: parseInt(analytics.four_star),
        3: parseInt(analytics.three_star),
        2: parseInt(analytics.two_star),
        1: parseInt(analytics.one_star),
      },
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  _applyCommonFilters(where, filters) {
    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [sequelize.Op.between]: [
          new Date(filters.startDate),
          new Date(filters.endDate),
        ],
      };
    }
  }

  _getLimit(filters) {
    return filters.limit ? parseInt(filters.limit) : 50;
  }

  _getModelConfig(entityType, entityId) {
    const configs = {
      academy: {
        model: AcademyReview,
        tableName: AcademyReview.tableName,
        whereClause: { academyId: entityId },
      },
      coach: {
        model: CoachReview,
        tableName: CoachReview.tableName,
        whereClause: { coachId: entityId },
      },
      program: {
        model: ProgramFeedback,
        tableName: ProgramFeedback.tableName,
        whereClause: { programId: entityId },
      },
      batch: {
        model: BatchFeedback,
        tableName: BatchFeedback.tableName,
        whereClause: { batchId: entityId },
      },
    };

    const config = configs[entityType];
    if (!config) {
      throw new Error("Invalid entity type");
    }
    return config;
  }

  async _getAcademyCoaches(academyId) {
    return await sequelize.query(
      `
      SELECT DISTINCT ac."coachId" as "coachId"
      FROM "AcademyCoach" ac
      WHERE ac."academyId" = :academyId
    `,
      {
        replacements: { academyId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  async _getAcademyStudentFeedback(studentId) {
    const feedback = await AcademyStudent.findAll({
      where: { studentId },
      attributes: [
        "studentId",
        "name",
        "coachFeedback",
        "createdAt",
        "academyId",
      ],
      include: [
        {
          model: AcademyProfile,
          as: "academy",
          attributes: ["academyId", "academy_name"],
        },
      ],
    });

    return feedback.map((af) => ({
      ...af.toJSON(),
      feedbacks: af.coachFeedback || [],
    }));
  }

  async _getCoachStudentFeedback(studentId) {
    const feedback = await CoachStudent.findAll({
      where: { userId: studentId },
      attributes: ["id", "name", "coachFeedback", "createdAt", "coachId"],
    });

    return feedback.map((cf) => ({
      ...cf.toJSON(),
      feedbacks: cf.coachFeedback || [],
    }));
  }

  async _getMonthlyProgress(studentId) {
    return await MonthlyStudentProgress.findAll({
      where: { studentId },
      attributes: [
        "progressId",
        "coachFeedback",
        "studentFeedback",
        "createdAt",
      ],
      include: [
        {
          model: Month,
          as: "month",
          attributes: ["monthId", "monthName", "year"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 12,
    });
  }

  async _updateAcademyStudentFeedback(studentId, academyId, feedback) {
    const student = await AcademyStudent.findOne({
      where: { studentId, academyId },
    });

    if (!student) {
      throw new Error("Academy student not found");
    }

    const currentFeedback = student.coachFeedback || [];
    const updatedFeedback = [
      ...currentFeedback,
      {
        ...feedback,
        createdAt: new Date(),
      },
    ];

    return await student.update({ coachFeedback: updatedFeedback });
  }

  async _updateCoachStudentFeedback(studentId, coachId, feedback) {
    const student = await CoachStudent.findOne({
      where: { userId: studentId, coachId },
    });

    if (!student) {
      throw new Error("Coach student not found");
    }

    const currentFeedback = student.coachFeedback || [];
    const updatedFeedback = [
      ...currentFeedback,
      {
        ...feedback,
        createdAt: new Date(),
      },
    ];

    return await student.update({ coachFeedback: updatedFeedback });
  }
}

module.exports = new FeedbackRepository();