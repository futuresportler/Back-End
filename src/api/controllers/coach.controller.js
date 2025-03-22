const coachService = require("../../services/coach/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { verifyAndExtractUser } = require("../../config/otp");
const { fatal } = require("../../config/logging");

const getCoachById = async (req, res) => {
  try {
    const coach = await coachService.getCoachById(req.user.coachId);
    if (!coach) return errorResponse(res, "Coach not found", 404);
    successResponse(res, "Coach fetched", coach);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const signup = async (req, res) => {
  try {
    const newCoach = await coachService.signUp(req.body);
    successResponse(res, "Coach created", newCoach, 201);
  } catch (error) {
    errorResponse(res, error.message || "Coach signup failed", error);
  }
};

const signin = async (req, res) => {
  try {
    const coach = await coachService.signIn(req.body);
    successResponse(res, "Coach logged in successfully", coach);
  } catch (error) {
    errorResponse(res, error.message || "Coach signin failed", error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await coachService.refreshToken(req.user.coachId);
    successResponse(res, "Token refreshed", { accessToken: tokens });
  } catch (error) {
    errorResponse(
      res,
      error.message || "Coach signin failed",
      error,
      error.statusCode
    );
  }
};

const updateCoach = async (req, res) => {
  try {
    const updatedCoach = await coachService.updateCoach(
      req.user.coachId,
      req.body
    );
    if (!updatedCoach) return errorResponse(res, "Coach not found", 404);
    successResponse(res, updatedCoach);
  } catch (error) {
    errorResponse(res, error);
  }
};

const deleteCoach = async (req, res) => {
  try {
    const deletedCoach = await coachService.deleteCoach(req.user.coachId);
    if (!deletedCoach) return errorResponse(res, "Coach not found", null, 404);
    successResponse(res, "Coach deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error);
  }
};

const verifyTokenAndUpdateCoach = async (req, res) => {
  try {
    const { idToken } = req.body;
    const { mobileNumber } = await verifyAndExtractUser(idToken);

    const coach = await coachService.getCoachByMobile(mobileNumber);
    if (!coach) return errorResponse(res, "Coach not found", null, 404);

    const updatedCoach = await coachService.updateCoach(coach.coachId, {
      mobile: mobileNumber, 
      isVerified: true,
    });

    successResponse(res, "Coach verified successfully", updatedCoach);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const requestOTP = async (req, res) => {
  try {
    const email = req.user.email;
    const response = await coachService.requestOTP(email);
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
    const response = await coachService.verifyOTPCode(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await coachService.forgotPassword(email);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const forgotPasswordOTPVerify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const response = await coachService.forgotPasswordOTPVerify(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const response = await coachService.resetPassword(
      req.user.coachId,
      password
    );
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const handleOAuthSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, "ID token is required", null, 400);
    }

    const result = await coachService.handleOAuth(idToken);

    successResponse(res, "OAuth authentication successful", result);
  } catch (error) {
    errorResponse(
      res,
      error.message || "OAuth authentication failed",
      error,
      error.statusCode || 401
    );
  }
};

const getAllCoaches = async (req, res) => {
  try {
    const coaches = await coachService.getAllCoaches();
    successResponse(res, "Coaches fetched", coaches);
  } catch (error) {
    errorResponse(res, error);
  }
};

module.exports = {
  getCoachById,
  signup,
  signin,
  refreshToken,
  updateCoach,
  deleteCoach,
  verifyTokenAndUpdateCoach,
  requestOTP,
  verifyOTP,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  handleOAuthSignIn,
  getAllCoaches,
};
