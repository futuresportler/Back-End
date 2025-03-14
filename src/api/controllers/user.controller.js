const userService = require("../../services/user/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
// const { verifyAndExtractUser } = require("../../config/otp");
const { fatal } = require("../../config/logging");

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

// const verifyTokenAndUpdateUser = async (req, res) => {
//   try {
//     const { idToken } = req.body;

//     // Step 1: Verify Token & Extract Data
//     const { mobileNumber } = await verifyAndExtractUser(idToken);

//     // Step 2: Fetch user by email
//     const user = await userService.getUserByMobile(mobileNumber);
//     if (!user) errorResponse(res, "User not found", user, 404);

//     // Step 3: Add mobile number if missing
//     const updatedUser = await userService.updateUser(user.userId, {
//       mobileNumber,
//       isVerified: true,
//     });

//     successResponse(res, "User verified successfully", updatedUser);
//   } catch (error) {
//     errorResponse(res, error.message, error);
//   }
// };

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

module.exports = {
  getUserById,
  signup,
  signin,
  refreshToken,
  updateUser,
  deleteUser,
  // verifyTokenAndUpdateUser,
  requestOTP,
  verifyOTP,
};
