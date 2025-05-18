const { sequelize } = require("../../database");
const { info, error } = require("../../config/logging");
const { Op } = require("sequelize");

// Session models
let AcademyBatchSession, AcademyProgramSession, CoachSession, TurfSession;
let AcademyBatchSessionRequest,
  AcademyProgramSessionRequest,
  CoachSessionRequest,
  TurfSessionRequest;

// Initialize models
const initModels = async () => {
  try {
    // Get session models
    const db = require("../../database");
    AcademyBatchSession = db.AcademyBatchSession;
    AcademyProgramSession = db.AcademyProgramSession;
    CoachSession = db.CoachSession;
    TurfSession = db.TurfSession;

    // Get session request models
    const sessionRequests =
      require("../../database/models/postgres/sessions/sessionRequests")(
        sequelize
      );
    AcademyBatchSessionRequest = sessionRequests.AcademyBatchSessionRequest;
    AcademyProgramSessionRequest = sessionRequests.AcademyProgramSessionRequest;
    CoachSessionRequest = sessionRequests.CoachSessionRequest;
    TurfSessionRequest = sessionRequests.TurfSessionRequest;

    // Add to database exports
    db.AcademyBatchSessionRequest = AcademyBatchSessionRequest;
    db.AcademyProgramSessionRequest = AcademyProgramSessionRequest;
    db.CoachSessionRequest = CoachSessionRequest;
    db.TurfSessionRequest = TurfSessionRequest;

    await sequelize.sync({ alter: true });
    info("Session request models initialized and synced");
    return true;
  } catch (err) {
    error("Failed to initialize session request models:", err);
    return false;
  }
};

/**
 * Get the appropriate session and request models based on service type
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @returns {Object} - Session and request models
 */
const getModels = (service) => {
  switch (service) {
    case "academy_batch":
      return {
        Session: AcademyBatchSession,
        Request: AcademyBatchSessionRequest,
      };
    case "academy_program":
      return {
        Session: AcademyProgramSession,
        Request: AcademyProgramSessionRequest,
      };
    case "coach":
      return { Session: CoachSession, Request: CoachSessionRequest };
    case "turf":
      return { Session: TurfSession, Request: TurfSessionRequest };
    default:
      throw new Error(`Invalid service type: ${service}`);
  }
};

/**
 * Request a session
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @param {string} user_id - User ID
 * @returns {Object} - Created session request
 */
const requestSession = async (service, session_id, user_id) => {
  try {
    const { Session, Request } = getModels(service);

    // Check if session exists and is available
    const session = await Session.findOne({
      where: {
        session_id,
        user_id: null,
        is_cancelled: false,
        is_completed: false,
      },
    });

    if (!session) {
      throw new Error("Session not found or not available");
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      where: {
        session_id,
        user_id,
      },
    });

    if (existingRequest) {
      throw new Error("Session request already exists");
    }

    // Create session request
    const request = await Request.create({
      session_id,
      user_id,
    });

    return request;
  } catch (err) {
    error(`Error requesting ${service} session:`, err);
    throw err;
  }
};

/**
 * Confirm a session request
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @returns {Object} - Updated session
 */
const confirmSessionRequest = async (service, session_id) => {
  try {
    const { Session, Request } = getModels(service);

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Find the request
      const request = await Request.findOne({
        where: {
          session_id,
          status: "pending",
        },
        transaction,
      });

      if (!request) {
        throw new Error("Session request not found or already processed");
      }

      // Update the session
      const session = await Session.findOne({
        where: {
          session_id,
          user_id: null,
          is_cancelled: false,
          is_completed: false,
        },
        transaction,
      });

      if (!session) {
        throw new Error("Session not found or not available");
      }

      // Update session with user_id
      await session.update(
        {
          user_id: request.user_id,
        },
        { transaction }
      );

      // Update request status
      await request.update(
        {
          status: "approved",
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      return {
        session: await Session.findByPk(session.id),
        request,
      };
    } catch (err) {
      // Rollback transaction
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    error(`Error confirming ${service} session request:`, err);
    throw err;
  }
};

/**
 * Reject a session request
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @param {string} reason - Rejection reason
 * @returns {Object} - Updated request
 */
const rejectSessionRequest = async (service, session_id, reason) => {
  try {
    const { Request } = getModels(service);

    // Find the request
    const request = await Request.findOne({
      where: {
        session_id,
        status: "pending",
      },
    });

    if (!request) {
      throw new Error("Session request not found or already processed");
    }

    // Update request status
    await request.update({
      status: "rejected",
      notes: reason || "Request rejected by supplier",
    });

    return request;
  } catch (err) {
    error(`Error rejecting ${service} session request:`, err);
    throw err;
  }
};

/**
 * Get available sessions
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {Object} filters - Filters for sessions
 * @returns {Array} - Available sessions
 */
const getAvailableSessions = async (service, filters = {}) => {
  try {
    const { Session } = getModels(service);

    // Build where clause
    const where = {
      user_id: null,
      is_cancelled: false,
      is_completed: false,
    };

    // Add date filter
    if (filters.startDate) {
      where.date = {
        [Op.gte]: filters.startDate,
      };
    }

    if (filters.endDate) {
      where.date = {
        ...where.date,
        [Op.lte]: filters.endDate,
      };
    }

    // Add service-specific filters
    if (service === "academy_batch" && filters.batch_id) {
      where.batch_id = filters.batch_id;
    }

    if (service === "academy_program" && filters.program_id) {
      where.program_id = filters.program_id;
    }

    if (service === "coach" && filters.coach_id) {
      where.coach_id = filters.coach_id;
    }

    if (service === "turf") {
      if (filters.ground_id) {
        where.ground_id = filters.ground_id;
      }
      if (filters.turf_id) {
        where.turf_id = filters.turf_id;
      }
    }

    // Get sessions
    const sessions = await Session.findAll({
      where,
      order: [
        ["date", "ASC"],
        ["start_time", "ASC"],
      ],
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    return sessions;
  } catch (err) {
    error(`Error getting available ${service} sessions:`, err);
    throw err;
  }
};

/**
 * Get user's booked sessions
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} user_id - User ID
 * @param {Object} filters - Filters for sessions
 * @returns {Array} - User's booked sessions
 */
const getUserSessions = async (service, user_id, filters = {}) => {
  try {
    const { Session } = getModels(service);

    // Build where clause
    const where = {
      user_id,
    };

    // Add status filter
    if (filters.status) {
      if (filters.status === "booked") {
        where.is_cancelled = false;
        where.is_completed = false;
      } else if (filters.status === "completed") {
        where.is_completed = true;
      } else if (filters.status === "cancelled") {
        where.is_cancelled = true;
      }
    }

    // Add date filter
    if (filters.startDate) {
      where.date = {
        [Op.gte]: filters.startDate,
      };
    }

    if (filters.endDate) {
      where.date = {
        ...where.date,
        [Op.lte]: filters.endDate,
      };
    }

    // Get sessions
    const sessions = await Session.findAll({
      where,
      order: [
        ["date", "ASC"],
        ["start_time", "ASC"],
      ],
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    return sessions;
  } catch (err) {
    error(`Error getting user's ${service} sessions:`, err);
    throw err;
  }
};

/**
 * Cancel a session
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @param {string} reason - Cancellation reason
 * @returns {Object} - Updated session
 */
const cancelSession = async (service, session_id, reason) => {
  try {
    const { Session } = getModels(service);

    // Find the session
    const session = await Session.findOne({
      where: {
        session_id,
        is_cancelled: false,
        is_completed: false,
      },
    });

    if (!session) {
      throw new Error("Session not found or already cancelled/completed");
    }

    // Update session
    await session.update({
      is_cancelled: true,
      reason: reason || "Session cancelled",
    });

    return session;
  } catch (err) {
    error(`Error cancelling ${service} session:`, err);
    throw err;
  }
};

/**
 * Complete a session
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @returns {Object} - Updated session
 */
const completeSession = async (service, session_id) => {
  try {
    const { Session } = getModels(service);

    // Find the session
    const session = await Session.findOne({
      where: {
        session_id,
        user_id: { [Op.ne]: null },
        is_cancelled: false,
        is_completed: false,
      },
    });

    if (!session) {
      throw new Error(
        "Session not found, not booked, or already cancelled/completed"
      );
    }

    // Update session
    await session.update({
      is_completed: true,
    });

    return session;
  } catch (err) {
    error(`Error completing ${service} session:`, err);
    throw err;
  }
};

/**
 * Add feedback to a session
 * @param {string} service - Service type ('academy_batch', 'academy_program', 'coach', 'turf')
 * @param {string} session_id - Session ID
 * @param {string} feedback - Feedback text
 * @param {number} rating - Rating (1-5)
 * @returns {Object} - Updated session
 */
const addSessionFeedback = async (service, session_id, feedback, rating) => {
  try {
    const { Session } = getModels(service);

    // Find the session
    const session = await Session.findOne({
      where: {
        session_id,
        user_id: { [Op.ne]: null },
        is_completed: true,
      },
    });

    if (!session) {
      throw new Error("Session not found, not booked, or not completed");
    }

    // Update session
    await session.update({
      feedback,
      rating,
    });

    return session;
  } catch (err) {
    error(`Error adding feedback to ${service} session:`, err);
    throw err;
  }
};

module.exports = {
  initModels,
  requestSession,
  confirmSessionRequest,
  rejectSessionRequest,
  getAvailableSessions,
  getUserSessions,
  cancelSession,
  completeSession,
  addSessionFeedback,
};
