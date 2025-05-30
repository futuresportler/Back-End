const { sequelize } = require("../../database");
const { info, error } = require("../../config/logging");
const { Op } = require("sequelize");
const moment = require("moment");
const SessionRepository = require('./repositories/sessionRepository');
const coachAnalyticsRepository = require('../coach/repositories/coachAnalyticsRepository');
const academyMetricsRepository = require('../academy/repositories/academyMetricsRepository');
const turfMetricsRepository = require('../turf/repositories/turfMetricsRepository');

// Session models
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
        // Request: AcademyBatchSessionRequest,
      };
    case "academy_program":
      return {
        Session: AcademyProgramSession,
        // Request: AcademyProgramSessionRequest,
      };
    case "coach":
      return { Session: CoachSession, 
        // Request: CoachSessionRequest 
      };
    case "turf":
      return { Session: TurfSession, 
        // Request: TurfSessionRequest 
      };
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
    await updateMetricsOnSessionEvent({
    sessionType,
    coachId: session.coachId,
    academyId: session.academyId,
    turfId: session.turfId,
    batchId: session.batchId,
    programId: session.programId,
    monthId: session.monthId,
    dayId: session.dayId
  }, 'cancelled');
  

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
    await updateMetricsOnSessionEvent({
      sessionType,
      coachId: session.coachId,
      academyId: session.academyId,
      turfId: session.turfId,
      batchId: session.batchId,
      programId: session.programId,
      monthId: session.monthId,
      dayId: session.dayId
    }, 'completed');
      

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

/**
 * Get all bookings for a user across all session types
 * @param {string} user_id - User ID
 * @param {Object} filters - Filters for bookings
 * @returns {Array} - User's bookings across all session types
 */
const getAllUserBookings = async (user_id, filters = {}) => {
  try {
    // Build where clause for all session types
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

    // Get sessions from all tables
    const [
      academyBatchSessions,
      academyProgramSessions,
      coachSessions,
      turfSessions,
    ] = await Promise.all([
      AcademyBatchSession.findAll({
        where,
        include: [
          {
            model: sequelize.models.AcademyBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
            include: [
              {
                model: sequelize.models.AcademyProfile,
                as: "academy",
                attributes: ["id", "name", "sport", "location"],
              },
            ],
          },
        ],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }),
      AcademyProgramSession.findAll({
        where,
        include: [
          {
            model: sequelize.models.AcademyProgram,
            as: "program",
            attributes: ["id", "name", "description"],
            include: [
              {
                model: sequelize.models.AcademyProfile,
                as: "academy",
                attributes: ["id", "name", "sport", "location"],
              },
            ],
          },
        ],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }),
      CoachSession.findAll({
        where,
        include: [
          {
            model: sequelize.models.CoachBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
            include: [
              {
                model: sequelize.models.CoachProfile,
                as: "coach",
                attributes: [
                  "id",
                  "name",
                  "sport",
                  "experience",
                  "specialization",
                ],
              },
            ],
          },
        ],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }),
      TurfSession.findAll({
        where,
        include: [
          {
            model: sequelize.models.TurfGround,
            as: "ground",
            attributes: ["id", "name", "type", "size"],
            include: [
              {
                model: sequelize.models.TurfProfile,
                as: "turf",
                attributes: ["id", "name", "location"],
              },
            ],
          },
        ],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      }),
    ]);

    // Add session type to each session
    const formattedAcademyBatchSessions = academyBatchSessions.map(
      (session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_batch" };
      }
    );

    const formattedAcademyProgramSessions = academyProgramSessions.map(
      (session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_program" };
      }
    );

    const formattedCoachSessions = coachSessions.map((session) => {
      const plainSession = session.get({ plain: true });
      return { ...plainSession, sessionType: "coach" };
    });

    const formattedTurfSessions = turfSessions.map((session) => {
      const plainSession = session.get({ plain: true });
      return { ...plainSession, sessionType: "turf" };
    });

    // Combine all sessions
    const allSessions = [
      ...formattedAcademyBatchSessions,
      ...formattedAcademyProgramSessions,
      ...formattedCoachSessions,
      ...formattedTurfSessions,
    ];

    // Sort by date and time
    allSessions.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA - dateB;
    });

    return allSessions;
  } catch (err) {
    error("Error getting all user bookings:", err);
    throw err;
  }
};

/**
 * Get latest completed sessions for a user
 * @param {string} user_id - User ID
 * @param {string} academy_id - Academy ID (optional)
 * @param {string} coach_id - Coach ID (optional)
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Array} - Latest completed sessions
 */
const getLatestCompletedSessions = async (
  user_id,
  academy_id,
  coach_id,
  limit = 10
) => {
  try {
    // Build where clause
    const where = {
      user_id,
      is_completed: true,
    };

    let sessions = [];

    if (academy_id) {
      // Get academy batch sessions
      const batchSessions = await AcademyBatchSession.findAll({
        where: {
          ...where,
          academy_id,
        },
        include: [
          {
            model: sequelize.models.AcademyBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "DESC"],
          ["end_time", "DESC"],
        ],
        limit,
      });

      // Get academy program sessions
      const programSessions = await AcademyProgramSession.findAll({
        where: {
          ...where,
          academy_id,
        },
        include: [
          {
            model: sequelize.models.AcademyProgram,
            as: "program",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "DESC"],
          ["end_time", "DESC"],
        ],
        limit,
      });

      // Add session type to each session
      const formattedBatchSessions = batchSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_batch" };
      });

      const formattedProgramSessions = programSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_program" };
      });

      // Combine academy sessions
      sessions = [...formattedBatchSessions, ...formattedProgramSessions];
    } else if (coach_id) {
      // Get coach sessions
      const coachSessions = await CoachSession.findAll({
        where: {
          ...where,
          coach_id,
        },
        include: [
          {
            model: sequelize.models.CoachBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "DESC"],
          ["end_time", "DESC"],
        ],
        limit,
      });

      // Add session type to each session
      sessions = coachSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "coach" };
      });
    }

    // Sort by date and time in descending order
    sessions.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.end_time}`);
      const dateB = new Date(`${b.date}T${b.end_time}`);
      return dateB - dateA;
    });

    // Limit the number of sessions
    return sessions.slice(0, limit);
  } catch (err) {
    error("Error getting latest completed sessions:", err);
    throw err;
  }
};

/**
 * Get upcoming sessions for a user
 * @param {string} user_id - User ID
 * @param {string} academy_id - Academy ID (optional)
 * @param {string} coach_id - Coach ID (optional)
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Array} - Upcoming sessions
 */
const getUpcomingSessions = async (
  user_id,
  academy_id,
  coach_id,
  limit = 10
) => {
  try {
    // Get current date
    const currentDate = moment().format("YYYY-MM-DD");

    // Build where clause
    const where = {
      user_id,
      is_cancelled: false,
      is_completed: false,
      date: {
        [Op.gte]: currentDate,
      },
    };

    let sessions = [];

    if (academy_id) {
      // Get academy batch sessions
      const batchSessions = await AcademyBatchSession.findAll({
        where: {
          ...where,
          academy_id,
        },
        include: [
          {
            model: sequelize.models.AcademyBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "ASC"],
          ["start_time", "ASC"],
        ],
        limit,
      });

      // Get academy program sessions
      const programSessions = await AcademyProgramSession.findAll({
        where: {
          ...where,
          academy_id,
        },
        include: [
          {
            model: sequelize.models.AcademyProgram,
            as: "program",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "ASC"],
          ["start_time", "ASC"],
        ],
        limit,
      });

      // Add session type to each session
      const formattedBatchSessions = batchSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_batch" };
      });

      const formattedProgramSessions = programSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "academy_program" };
      });

      // Combine academy sessions
      sessions = [...formattedBatchSessions, ...formattedProgramSessions];
    } else if (coach_id) {
      // Get coach sessions
      const coachSessions = await CoachSession.findAll({
        where: {
          ...where,
          coach_id,
        },
        include: [
          {
            model: sequelize.models.CoachBatch,
            as: "batch",
            attributes: ["id", "name", "description"],
          },
        ],
        order: [
          ["date", "ASC"],
          ["start_time", "ASC"],
        ],
        limit,
      });

      // Add session type to each session
      sessions = coachSessions.map((session) => {
        const plainSession = session.get({ plain: true });
        return { ...plainSession, sessionType: "coach" };
      });
    }

    // Sort by date and time in ascending order
    sessions.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA - dateB;
    });

    // Limit the number of sessions
    return sessions.slice(0, limit);
  } catch (err) {
    error("Error getting upcoming sessions:", err);
    throw err;
  }
};
const getAllUserCoachBookings= async (userId) => {
  try {
    // Implement based on your existing coach booking logic
    // This should return all coach bookings for the user
    return await SessionRepository.findCoachBookingsByUserId(userId);
  } catch (error) {
    console.error('Error getting user coach bookings:', error);
    return [];
  }
}
const getAllUserAcademyBookings = async (userId) => {
  try {
    // Implement based on your existing academy booking logic
    return await SessionRepository.findAcademyBookingsByUserId(userId);
  } catch (error) {
    console.error('Error getting user academy bookings:', error);
    return [];
  }
}

const getAllUserTurfBookings= async (userId) =>{
  try {
    // Implement based on your existing turf booking logic
    return await SessionRepository.findTurfBookingsByUserId(userId);
  } catch (error) {
    console.error('Error getting user turf bookings:', error);
    return [];
  }
}

const getUserCoachSessions= async (userId, coachId) =>{
  try {
    return await SessionRepository.findUserCoachSessions(userId, coachId);
  } catch (error) {
    console.error('Error getting user coach sessions:', error);
    return [];
  }
}

const getUserAcademySessions= async (userId, academyId) =>{
  try {
    return await SessionRepository.findUserAcademySessions(userId, academyId);
  } catch (error) {
    console.error('Error getting user academy sessions:', error);
    return [];
  }
}

const getUserTurfSessions= async (userId, turfId) =>{
  try {
    return await SessionRepository.findUserTurfSessions(userId, turfId);
  } catch (error) {
    console.error('Error getting user turf sessions:', error);
    return [];
      }
}
const updateMetricsOnSessionEvent = async (sessionData, eventType) => {
  try {
    const { sessionType, coachId, academyId, turfId, batchId, programId, monthId, dayId } = sessionData;
    
    switch (eventType) {
      case 'created':
        if (sessionType === 'coach' && coachId) {
          await coachAnalyticsRepository.incrementMetricCounter(coachId, monthId, 'totalSessions');
          if (batchId) {
            await coachAnalyticsRepository.incrementBatchMetricCounter(batchId, monthId, 'totalSessions');
          }
        }
        if (sessionType === 'academy' && academyId) {
          await academyMetricsRepository.incrementMetricCounter(academyId, monthId, dayId, 'totalSessions');
          if (batchId) {
            await academyMetricsRepository.incrementBatchMetricCounter(batchId, monthId, 'totalSessions');
          }
          if (programId) {
            await academyMetricsRepository.incrementProgramMetricCounter(programId, monthId, 'totalSessions');
          }
        }
        if (sessionType === 'turf' && turfId) {
          await turfMetricsRepository.incrementMetricCounter(turfId, monthId, dayId, 'totalBookings');
        }
        break;
      case 'completed':
        if (sessionType === 'coach' && coachId) {
          await coachAnalyticsRepository.incrementMetricCounter(coachId, monthId, 'completedSessions');
          if (batchId) {
            await coachAnalyticsRepository.incrementBatchMetricCounter(batchId, monthId, 'completedSessions');
          }
        }
        if (sessionType === 'academy' && academyId) {
          await academyMetricsRepository.incrementMetricCounter(academyId, monthId, dayId, 'completedSessions');
          if (batchId) {
            await academyMetricsRepository.incrementBatchMetricCounter(batchId, monthId, 'completedSessions');
          }
          if (programId) {
            await academyMetricsRepository.incrementProgramMetricCounter(programId, monthId, 'completedSessions');
          }
        }
        if (sessionType === 'turf' && turfId) {
          await turfMetricsRepository.incrementMetricCounter(turfId, monthId, dayId, 'completedBookings');
        }
        break;
        case 'cancelled':
        if (sessionType === 'coach' && coachId) {
          await coachAnalyticsRepository.incrementMetricCounter(coachId, monthId, 'cancelledSessions');
          if (batchId) {
            await coachAnalyticsRepository.incrementBatchMetricCounter(batchId, monthId, 'cancelledSessions');
          }
        }
        if (sessionType === 'academy' && academyId) {
          await academyMetricsRepository.incrementMetricCounter(academyId, monthId, dayId, 'cancelledSessions');
          if (batchId) {
            await academyMetricsRepository.incrementBatchMetricCounter(batchId, monthId, 'cancelledSessions');
          }
          if (programId) {
            await academyMetricsRepository.incrementProgramMetricCounter(programId, monthId, 'cancelledSessions');
          }
        }
        if (sessionType === 'turf' && turfId) {
          await turfMetricsRepository.incrementMetricCounter(turfId, monthId, dayId, 'cancelledBookings');
        }
        break;
    }
  } catch (error) {
    console.error('Error updating metrics on session event:', error);
  }
};
        


module.exports = {
  requestSession,
  confirmSessionRequest,
  rejectSessionRequest,
  getAvailableSessions,
  getUserSessions,
  cancelSession,
  completeSession,
  addSessionFeedback,
  getAllUserBookings,
  getLatestCompletedSessions,
  getUpcomingSessions,
  updateMetricsOnSessionEvent,
  getAllUserCoachBookings,
  getAllUserAcademyBookings,
  getAllUserTurfBookings,
  getUserCoachSessions,
  getUserAcademySessions,
  getUserTurfSessions,
};
