const userService = require("../../services/user/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { verifyAndExtractUser } = require("../../config/otp");
const { fatal } = require("../../config/logging");
const { userFavoriteService } = require("../../services/user");

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) return errorResponse(res, "User not found", 404);
    successResponse(res, "User fetched", user);
  } catch (error) {
    errorResponse(res, error);
  }
};

const signup = async (req, res) => {
  try {
    const newUser = await userService.signUp(req.body);
    successResponse(res, "User created", newUser, 201);
  } catch (error) {
    errorResponse(res, error.message || "User signup failed", error);
  }
};

const signin = async (req, res) => {
  try {
    const user = await userService.signIn(req.body);
    successResponse(res, "User logged in successfully", user);
  } catch (error) {
    errorResponse(res, error.message || "User signin failed", error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await userService.refreshToken(req.user.userId);
    successResponse(res, "Token refreshed", { accessToken: tokens });
  } catch (error) {
    errorResponse(
      res,
      error.message || "User signin failed",
      error,
      error.statusCode
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.user.userId, req.body);
    if (!updatedUser) return errorResponse(res, "User not found", 404);
    successResponse(res, updatedUser);
  } catch (error) {
    errorResponse(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.user.userId);
    if (!deletedUser) return errorResponse(res, "User not found", null, 404);
    successResponse(res, "User deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error);
  }
};

const verifyTokenAndUpdateUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    const { mobileNumber } = await verifyAndExtractUser(idToken);

    const user = await userService.getUserByMobile(mobileNumber);
    if (!user) return errorResponse(res, "User not found", null, 404);

    const updatedUser = await userService.updateUser(user.userId, {
      mobile: mobileNumber,
      isVerified: true,
    });

    successResponse(res, "User verified successfully", updatedUser);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const requestOTP = async (req, res) => {
  try {
    const email = req.user.email;
    const response = await userService.requestOTP(email);
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
    const response = await userService.verifyOTPCode(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await userService.forgotPassword(email);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const forgotPasswordOTPVerify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const response = await userService.forgotPasswordOTPVerify(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const response = await userService.resetPassword(req.user.userId, password);
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

    const result = await userService.handleOAuth(idToken);

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

const addToFavorites = async (req, res) => {
  try {
    const { entityType, entityId } = req.body;
    const userId = req.user.userId;

    const favorite = await userFavoriteService.addToFavorites(userId, entityType, entityId);
    
    successResponse(res, "Added to favorites successfully", favorite, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.userId;

    await userFavoriteService.removeFromFavorites(userId, entityType, entityId);
    
    successResponse(res, "Removed from favorites successfully");
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { entityType } = req.query;

    const favorites = await userFavoriteService.getUserFavorites(userId, entityType);
    
    successResponse(res, "Favorites fetched successfully", favorites);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const checkIsFavorite = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.userId;

    const isFavorite = await userFavoriteService.checkIsFavorite(userId, entityType, entityId);
    
    successResponse(res, "Favorite status checked", { isFavorite });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getFavoriteStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await userFavoriteService.getFavoriteStats(userId);
    
    successResponse(res, "Favorite statistics fetched", stats);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};
module.exports = {
  getUserById,
  signup,
  signin,
  refreshToken,
  updateUser,
  deleteUser,
  verifyTokenAndUpdateUser,
  requestOTP,
  verifyOTP,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  handleOAuthSignIn,

  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkIsFavorite,
  getFavoriteStats
};
