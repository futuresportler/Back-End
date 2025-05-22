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
  sequelize 
} = require("../../../database");

class FeedbackRepository {
  // ============ GET FEEDBACK METHODS ============

  // Academy Feedback
  async getAcademyFeedback(academyId, filters = {}) {
    const where = { academyId };
    
    if (filters.rating) {
      where.rating = filters.rating;
    }
    
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [sequelize.Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }

    return await AcademyReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name", "email"]
        },
        {
          model: AcademyProfile,
          as: "academy",
          attributes: ["academyId", "academy_name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  async getAcademyCoachFeedback(academyId, filters = {}) {
    const coaches = await sequelize.query(`
      SELECT DISTINCT ac."platformCoachId" as "coachId"
      FROM "AcademyCoaches" ac
      WHERE ac."academyId" = :academyId
    `, {
      replacements: { academyId },
      type: sequelize.QueryTypes.SELECT
    });

    const coachIds = coaches.map(c => c.coachId);
    
    if (coachIds.length === 0) return [];

    const where = { 
      coachId: { [sequelize.Op.in]: coachIds },
      isPublic: true 
    };

    if (filters.rating) {
      where.rating = filters.rating;
    }

    return await CoachReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        },
        {
          model: CoachProfile,
          as: "coach",
          attributes: ["coachId", "name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
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
          required: false
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });

    // Format coach feedback array
    return students.map(student => ({
      ...student.toJSON(),
      feedbacks: student.coachFeedback || []
    }));
  }

  async getAcademyBatchFeedback(academyId, filters = {}) {
    const batches = await AcademyBatch.findAll({
      where: { academyId },
      attributes: ["batchId", "batchName"]
    });

    const batchIds = batches.map(b => b.batchId);
    
    if (batchIds.length === 0) return [];

    const where = {
      batchId: { [sequelize.Op.in]: batchIds },
      batchType: "academy"
    };

    if (filters.rating) {
      where.rating = filters.rating;
    }

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  async getAcademyProgramFeedback(academyId, filters = {}) {
    const programs = await AcademyProgram.findAll({
      where: { academyId },
      attributes: ["programId", "programName"]
    });

    const programIds = programs.map(p => p.programId);
    
    if (programIds.length === 0) return [];

    const where = {
      programId: { [sequelize.Op.in]: programIds }
    };

    if (filters.rating) {
      where.rating = filters.rating;
    }

    return await ProgramFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        },
        {
          model: AcademyProgram,
          as: "program",
          attributes: ["programId", "programName"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  // Coach Feedback
  async getCoachFeedback(coachId, filters = {}) {
    const where = { coachId };
    
    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.verified !== undefined) {
      where.verifiedPurchase = filters.verified;
    }

    return await CoachReview.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        },
        {
          model: CoachProfile,
          as: "coach",
          attributes: ["coachId", "name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
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
      limit: filters.limit ? parseInt(filters.limit) : 50
    });

    return students.map(student => ({
      ...student.toJSON(),
      feedbacks: student.coachFeedback || []
    }));
  }

  async getCoachBatchFeedback(coachId, filters = {}) {
    const batches = await CoachBatch.findAll({
      where: { coachId },
      attributes: ["batchId", "name"]
    });

    const batchIds = batches.map(b => b.batchId);
    
    if (batchIds.length === 0) return [];

    const where = {
      batchId: { [sequelize.Op.in]: batchIds },
      batchType: "coach"
    };

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  // Student Feedback
  async getStudentFeedback(studentId, filters = {}) {
    const [academyFeedback, coachFeedback, monthlyProgress] = await Promise.all([
      AcademyStudent.findAll({
        where: { studentId },
        attributes: ["studentId", "name", "coachFeedback", "createdAt", "academyId"],
        include: [
          {
            model: AcademyProfile,
            as: "academy",
            attributes: ["academyId", "academy_name"]
          }
        ]
      }),
      CoachStudent.findAll({
        where: { userId: studentId },
        attributes: ["id", "name", "coachFeedback", "createdAt", "coachId"]
      }),
      MonthlyStudentProgress.findAll({
        where: { studentId },
        attributes: ["progressId", "coachFeedback", "studentFeedback", "createdAt"],
        include: [
          {
            model: Month,
            as: "month",
            attributes: ["monthId", "monthName", "year"]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: 12
      })
    ]);

    return {
      academyFeedback: academyFeedback.map(af => ({
        ...af.toJSON(),
        feedbacks: af.coachFeedback || []
      })),
      coachFeedback: coachFeedback.map(cf => ({
        ...cf.toJSON(),
        feedbacks: cf.coachFeedback || []
      })),
      monthlyProgress
    };
  }

  // Batch Feedback
  async getBatchFeedback(batchId, batchType, filters = {}) {
    const where = { batchId, batchType };

    if (filters.rating) {
      where.rating = filters.rating;
    }

    return await BatchFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  // Program Feedback
  async getProgramFeedback(programId, filters = {}) {
    const where = { programId };

    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.completionStatus) {
      where.completionStatus = filters.completionStatus;
    }

    return await ProgramFeedback.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "first_name", "last_name"]
        },
        {
          model: AcademyProgram,
          as: "program",
          attributes: ["programId", "programName"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: filters.limit ? parseInt(filters.limit) : 50
    });
  }

  // Session Feedback
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
          attributes: ["userId", "first_name", "last_name"]
        }
      ],
      order: [["createdAt", "DESC"]]
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
      const student = await AcademyStudent.findOne({
        where: { studentId, academyId }
      });
      
      if (student) {
        const currentFeedback = student.coachFeedback || [];
        const updatedFeedback = [...currentFeedback, {
          ...feedback,
          createdAt: new Date()
        }];
        
        return await student.update({ coachFeedback: updatedFeedback });
      }
    }
    
    if (coachId) {
      const student = await CoachStudent.findOne({
        where: { userId: studentId, coachId }
      });
      
      if (student) {
        const currentFeedback = student.coachFeedback || [];
        const updatedFeedback = [...currentFeedback, {
          ...feedback,
          createdAt: new Date()
        }];
        
        return await student.update({ coachFeedback: updatedFeedback });
      }
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
    let model, whereClause;
    
    switch (entityType) {
      case 'academy':
        model = AcademyReview;
        whereClause = { academyId: entityId };
        break;
      case 'coach':
        model = CoachReview;
        whereClause = { coachId: entityId };
        break;
      case 'program':
        model = ProgramFeedback;
        whereClause = { programId: entityId };
        break;
      case 'batch':
        model = BatchFeedback;
        whereClause = { batchId: entityId };
        break;
      default:
        throw new Error('Invalid entity type');
    }

    const [analytics] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating::numeric) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM "${model.tableName}"
      WHERE ${Object.keys(whereClause).map(key => `"${key}" = :${key}`).join(' AND ')}
    `, {
      replacements: whereClause,
      type: sequelize.QueryTypes.SELECT
    });

    return {
      totalReviews: parseInt(analytics.total_reviews),
      averageRating: parseFloat(analytics.average_rating || 0).toFixed(2),
      ratingDistribution: {
        5: parseInt(analytics.five_star),
        4: parseInt(analytics.four_star),
        3: parseInt(analytics.three_star),
        2: parseInt(analytics.two_star),
        1: parseInt(analytics.one_star)
      }
    };
  }
}

module.exports = new FeedbackRepository();