const feedbackRepository = require("./repositories/feedbackRepository");
const { v4: uuidv4 } = require("uuid");

class FeedbackService {
  // ============ GET FEEDBACK METHODS ============

  async getAcademyFeedback(academyId, filters = {}) {
    try {
      return await feedbackRepository.getAcademyFeedback(academyId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch academy feedback: ${error.message}`);
    }
  }

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

  async getCoachFeedback(coachId, filters = {}) {
    try {
      return await feedbackRepository.getCoachFeedback(coachId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch coach feedback: ${error.message}`);
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

  async getStudentFeedback(studentId, filters = {}) {
    try {
      return await feedbackRepository.getStudentFeedback(studentId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch student feedback: ${error.message}`);
    }
  }

  async getBatchFeedback(batchId, batchType, filters = {}) {
    try {
      return await feedbackRepository.getBatchFeedback(batchId, batchType, filters);
    } catch (error) {
      throw new Error(`Failed to fetch batch feedback: ${error.message}`);
    }
  }

  async getProgramFeedback(programId, filters = {}) {
    try {
      return await feedbackRepository.getProgramFeedback(programId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch program feedback: ${error.message}`);
    }
  }

  async getSessionFeedback(sessionId, filters = {}) {
    try {
      return await feedbackRepository.getSessionFeedback(sessionId, filters);
    } catch (error) {
      throw new Error(`Failed to fetch session feedback: ${error.message}`);
    }
  }

  // ============ CREATE FEEDBACK METHODS ============

  async createAcademyFeedback(academyId, feedbackData, userId) {
    try {
      const feedback = {
        reviewId: uuidv4(),
        academyId,
        userId,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        verifiedPurchase: feedbackData.verifiedPurchase || false
      };

      return await feedbackRepository.createAcademyFeedback(feedback);
    } catch (error) {
      throw new Error(`Failed to create academy feedback: ${error.message}`);
    }
  }

  async createCoachFeedback(coachId, feedbackData, userId) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to create coach feedback: ${error.message}`);
    }
  }

  async createStudentFeedback(studentId, feedbackData, userId) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to create student feedback: ${error.message}`);
    }
  }

  async createBatchFeedback(batchId, feedbackData, userId) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to create batch feedback: ${error.message}`);
    }
  }

  async createProgramFeedback(programId, feedbackData, userId) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to create program feedback: ${error.message}`);
    }
  }

  async createSessionFeedback(sessionId, feedbackData, userId) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to create session feedback: ${error.message}`);
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

  // ============ UTILITY METHODS ============

  async getRecentFeedback(entityType, entityId, limit = 5) {
    try {
      const filters = { limit };
      
      switch (entityType) {
        case 'academy':
          return await this.getAcademyFeedback(entityId, filters);
        case 'coach':
          return await this.getCoachFeedback(entityId, filters);
        case 'program':
          return await this.getProgramFeedback(entityId, filters);
        case 'batch':
          // Need to determine batch type, defaulting to academy
          return await this.getBatchFeedback(entityId, 'academy', filters);
        default:
          throw new Error('Invalid entity type');
      }
    } catch (error) {
      throw new Error(`Failed to fetch recent feedback: ${error.message}`);
    }
  }
}

module.exports = new FeedbackService();