const feedbackRepository = require("./repositories/feedbackRepository");
const { v4: uuidv4 } = require("uuid");

class FeedbackService {
  // ============ UNIVERSAL ENTITY METHODS ============

  async getEntityFeedback(entityType, entityId, filters = {}) {
    try {
      switch (entityType) {
        case 'academy':
          return await feedbackRepository.getAcademyFeedback(entityId, filters);
        case 'coach':
          return await feedbackRepository.getCoachFeedback(entityId, filters);
        case 'student':
          return await feedbackRepository.getStudentFeedback(entityId, filters);
        case 'batch':
          const batchType = filters.batchType || 'academy';
          return await feedbackRepository.getBatchFeedback(entityId, batchType, filters);
        case 'program':
          return await feedbackRepository.getProgramFeedback(entityId, filters);
        case 'session':
          return await feedbackRepository.getSessionFeedback(entityId, filters);
        default:
          throw new Error('Invalid entity type');
      }
    } catch (error) {
      throw new Error(`Failed to fetch ${entityType} feedback: ${error.message}`);
    }
  }

  async createEntityFeedback(entityType, entityId, feedbackData, userId) {
    try {
      switch (entityType) {
        case 'academy':
          return await this._createAcademyFeedback(entityId, feedbackData, userId);
        case 'coach':
          return await this._createCoachFeedback(entityId, feedbackData, userId);
        case 'student':
          return await this._createStudentFeedback(entityId, feedbackData, userId);
        case 'batch':
          return await this._createBatchFeedback(entityId, feedbackData, userId);
        case 'program':
          return await this._createProgramFeedback(entityId, feedbackData, userId);
        case 'session':
          return await this._createSessionFeedback(entityId, feedbackData, userId);
        default:
          throw new Error('Invalid entity type');
      }
    } catch (error) {
      throw new Error(`Failed to create ${entityType} feedback: ${error.message}`);
    }
  }

  // ============ HIERARCHICAL FEEDBACK METHODS ============

  async getAcademyCoachFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyCoachFeedback(academyId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch academy coach feedback: ${error.message}`);
    }
  }

  async getAcademyStudentFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyStudentFeedback(academyId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch academy student feedback: ${error.message}`);
    }
  }

  async getAcademyBatchFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyBatchFeedback(academyId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch academy batch feedback: ${error.message}`);
    }
  }

  async getAcademyProgramFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyProgramFeedback(academyId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch academy program feedback: ${error.message}`);
    }
  }

  async getCoachStudentFeedback(coachId, filters = {}) {
    try {
      return await feedbackRepository.getCoachStudentFeedback(coachId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch coach student feedback: ${error.message}`);
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
      return await feedbackRepository.getFeedbackAnalytics(entityType, entityId);
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

  // ============ PRIVATE CREATE METHODS ============

  async _createAcademyFeedback(academyId, feedbackData, userId) {
    const feedback = {
      reviewId: uuidv4(),
      academyId,
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      verifiedPurchase: feedbackData.verifiedPurchase || false
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
      isPublic: feedbackData.isPublic !== undefined ? feedbackData.isPublic : true
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
        feedbackType: feedbackData.feedbackType || 'general',
        userId
      }
    };
    return await feedbackRepository.createStudentFeedback(feedback);
  }

  async _createBatchFeedback(batchId, feedbackData, userId) {
    const feedback = {
      feedbackId: uuidv4(),
      batchId,
      batchType: feedbackData.batchType || 'academy',
      userId,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      feedbackAspects: feedbackData.feedbackAspects || {}
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
      completionStatus: feedbackData.completionStatus || 'ongoing'
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
      feedbackType: feedbackData.feedbackType || 'student_to_session',
      isPublic: feedbackData.isPublic !== undefined ? feedbackData.isPublic : true
    };
    return await feedbackRepository.createSessionFeedback(feedback);
  }
}

module.exports = new FeedbackService();