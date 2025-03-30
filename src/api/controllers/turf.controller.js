const turfService = require("../../services/turf/index");
const userService = require("../../services/user/index"); // Add missing import
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { fatal } = require("../../config/logging");

const getTurfById = async (req, res) => {
  try {
    const turf = await turfService.getTurfById(req.user.turfId);
    if (!turf) return errorResponse(res, "Turf not found", 404);
    successResponse(res, "Turf fetched", turf);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const getAllTurfs = async (req, res) => {
  try {
    // Ensure we have default values that are numbers
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    let latitude = req.query.latitude ? parseFloat(req.query.latitude) : null;
    let longitude = req.query.longitude
      ? parseFloat(req.query.longitude)
      : null;

    // If user is logged in, try to get their location
    if (req.user && req.user.userId && (!latitude || !longitude)) {
      try {
        const user = await userService.getUserById(req.user.userId);
        if (user && user.latitude && user.longitude) {
          latitude = user.latitude;
          longitude = user.longitude;
        }
      } catch (userError) {
        // Just log the error but continue execution
        console.warn("Failed to get user location:", userError.message);
      }
    }

    // Create options object with guaranteed values
    const options = {
      page: page || 1, // Ensure we never pass undefined
      limit: limit || 10,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    const turfs = await turfService.getAllTurfs(options);
    successResponse(res, "All turfs fetched", turfs);
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Get All Turfs Failed",
      error,
      error.statusCode || 500
    );
  }
};

const signup = async (req, res) => {
  try {
    const newTurf = await turfService.signUp(req.body);
    successResponse(res, "Turf created", newTurf, 201);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Turf signup failed", error);
  }
};

const signin = async (req, res) => {
  try {
    const turf = await turfService.signIn(req.body);
    successResponse(res, "Turf logged in successfully", turf);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Turf signin failed", error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await turfService.refreshToken(req.user.turfId);
    successResponse(res, "Token refreshed", { accessToken: tokens });
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Token refresh failed",
      error,
      error.statusCode
    );
  }
};

const updateTurf = async (req, res) => {
  try {
    const updatedTurf = await turfService.updateTurf(req.user.turfId, req.body);
    if (!updatedTurf) return errorResponse(res, "Turf not found", 404);
    successResponse(res, "Turf updated", updatedTurf);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const deleteTurf = async (req, res) => {
  try {
    const deletedTurf = await turfService.deleteTurf(req.user.turfId);
    if (!deletedTurf) return errorResponse(res, "Turf not found", null, 404);
    successResponse(res, "Turf deleted successfully", null, 204);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const requestOTP = async (req, res) => {
  try {
    const email = req.user.email;
    const response = await turfService.requestOTP(email);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.user.email;
    const response = await turfService.verifyOTPCode(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await turfService.forgotPassword(email);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const forgotPasswordOTPVerify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const response = await turfService.forgotPasswordOTPVerify(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const response = await turfService.resetPassword(req.user.turfId, password);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const addComment = async (req, res) => {
  try {
    const { turfId } = req.params;
    const userId = req.user.userId;
    const commentData = {
      ...req.body,
      reviewer_id: userId,
      entity_id: turfId,
      entity_type: "Turf",
    };

    const newComment = await turfService.addComment(commentData);
    successResponse(res, "Comment added successfully", newComment, 201);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Failed to add comment", error);
  }
};

const updateComment = async (req, res) => {
  try {
    const { turfId, reviewId } = req.params;
    const userId = req.user.userId;

    const updatedComment = await turfService.updateComment(reviewId, {
      ...req.body,
      reviewer_id: userId,
      entity_id: turfId,
      entity_type: "Turf",
    });

    successResponse(res, "Comment updated successfully", updatedComment);
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Failed to update comment",
      error,
      error.statusCode || 500
    );
  }
};

const deleteComment = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const result = await turfService.deleteComment(reviewId, userId);
    successResponse(res, result.message);
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Failed to delete comment",
      error,
      error.statusCode || 500
    );
  }
};

const bookTurf = async (req, res) => {
  try {
    const { turfId } = req.params;
    const userId = req.user.userId;

    // Include user ID and turf ID in the booking data
    const bookingData = {
      ...req.body,
      userId,
      turfId,
    };

    const result = await turfService.bookTurf(bookingData);
    successResponse(res, "Booking request received", result);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Failed to book turf", error);
  }
};

const getTurfCalendar = async (req, res) => {
  try {
    const { turfId } = req.params;
    const result = await turfService.getTurfCalendar(turfId);
    successResponse(res, "Turf calendar retrieved", result);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Failed to get turf calendar", error);
  }
};

module.exports = {
  getTurfById,
  getAllTurfs,
  signup,
  signin,
  refreshToken,
  updateTurf,
  deleteTurf,
  requestOTP,
  verifyOTP,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  addComment,
  updateComment,
  deleteComment,
  bookTurf,
  getTurfCalendar,
};
