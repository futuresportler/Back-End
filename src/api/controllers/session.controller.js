const {
  success,
  error: errorResponse,
} = require("../../common/utils/response");
const sessionService = require("../../services/session/sessionService");
const { error, info } = require("../../config/logging");

/**
 * Request a session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const requestSession = async (req, res) => {
  try {
    const { service, session_id, user_id } = req.body;

    if (!service || !session_id || !user_id) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id, user_id"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const request = await sessionService.requestSession(
      service,
      session_id,
      user_id
    );
    return success(res, 201, "Session request created successfully", request);
  } catch (err) {
    error("Error requesting session:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Confirm a session request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const confirmSessionRequest = async (req, res) => {
  try {
    const { service, session_id } = req.body;

    if (!service || !session_id) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const result = await sessionService.confirmSessionRequest(
      service,
      session_id
    );
    return success(res, 200, "Session request confirmed successfully", result);
  } catch (err) {
    error("Error confirming session request:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Reject a session request
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const rejectSessionRequest = async (req, res) => {
  try {
    const { service, session_id, reason } = req.body;

    if (!service || !session_id) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const request = await sessionService.rejectSessionRequest(
      service,
      session_id,
      reason
    );
    return success(res, 200, "Session request rejected successfully", request);
  } catch (err) {
    error("Error rejecting session request:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Get available sessions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAvailableSessions = async (req, res) => {
  try {
    const { service } = req.params;
    const filters = req.query;

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const sessions = await sessionService.getAvailableSessions(
      service,
      filters
    );
    return success(
      res,
      200,
      "Available sessions retrieved successfully",
      sessions
    );
  } catch (err) {
    error("Error getting available sessions:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Get user's booked sessions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getUserSessions = async (req, res) => {
  try {
    const { service } = req.params;
    const { user_id } = req.params;
    const filters = req.query;

    if (!user_id) {
      return errorResponse(res, 400, "Missing required parameter: user_id");
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const sessions = await sessionService.getUserSessions(
      service,
      user_id,
      filters
    );
    return success(res, 200, "User sessions retrieved successfully", sessions);
  } catch (err) {
    error("Error getting user sessions:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Cancel a session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const cancelSession = async (req, res) => {
  try {
    const { service, session_id, reason } = req.body;

    if (!service || !session_id) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const session = await sessionService.cancelSession(
      service,
      session_id,
      reason
    );
    return success(res, 200, "Session cancelled successfully", session);
  } catch (err) {
    error("Error cancelling session:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Complete a session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const completeSession = async (req, res) => {
  try {
    const { service, session_id } = req.body;

    if (!service || !session_id) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    const session = await sessionService.completeSession(service, session_id);
    return success(res, 200, "Session completed successfully", session);
  } catch (err) {
    error("Error completing session:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Add feedback to a session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const addSessionFeedback = async (req, res) => {
  try {
    const { service, session_id, feedback, rating } = req.body;

    if (!service || !session_id || !feedback || !rating) {
      return errorResponse(
        res,
        400,
        "Missing required fields: service, session_id, feedback, rating"
      );
    }

    // Validate service type
    if (
      !["academy_batch", "academy_program", "coach", "turf"].includes(service)
    ) {
      return errorResponse(
        res,
        400,
        "Invalid service type. Must be one of: academy_batch, academy_program, coach, turf"
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return errorResponse(res, 400, "Rating must be between 1 and 5");
    }

    const session = await sessionService.addSessionFeedback(
      service,
      session_id,
      feedback,
      rating
    );
    return success(res, 200, "Session feedback added successfully", session);
  } catch (err) {
    error("Error adding session feedback:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Get all bookings for a user across all session types
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const filters = req.query;

    if (!user_id) {
      return errorResponse(res, 400, "Missing required parameter: user_id");
    }

    const bookings = await sessionService.getAllUserBookings(user_id, filters);
    return success(res, 200, "User bookings retrieved successfully", bookings);
  } catch (err) {
    error("Error getting user bookings:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Get latest completed sessions for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getLatestCompletedSessions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { academy_id, coach_id, limit } = req.query;

    if (!user_id) {
      return errorResponse(res, 400, "Missing required parameter: user_id");
    }

    // User must provide either academy_id or coach_id
    if (!academy_id && !coach_id) {
      return errorResponse(
        res,
        400,
        "Either academy_id or coach_id must be provided"
      );
    }

    const sessions = await sessionService.getLatestCompletedSessions(
      user_id,
      academy_id,
      coach_id,
      Number.parseInt(limit) || 10
    );
    return success(
      res,
      200,
      "Latest completed sessions retrieved successfully",
      sessions
    );
  } catch (err) {
    error("Error getting latest completed sessions:", err);
    return errorResponse(res, 500, err.message);
  }
};

/**
 * Get upcoming sessions for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getUpcomingSessions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { academy_id, coach_id, limit } = req.query;

    if (!user_id) {
      return errorResponse(res, 400, "Missing required parameter: user_id");
    }

    // User must provide either academy_id or coach_id
    if (!academy_id && !coach_id) {
      return errorResponse(
        res,
        400,
        "Either academy_id or coach_id must be provided"
      );
    }

    const sessions = await sessionService.getUpcomingSessions(
      user_id,
      academy_id,
      coach_id,
      Number.parseInt(limit) || 10
    );
    return success(
      res,
      200,
      "Upcoming sessions retrieved successfully",
      sessions
    );
  } catch (err) {
    error("Error getting upcoming sessions:", err);
    return errorResponse(res, 500, err.message);
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
};
