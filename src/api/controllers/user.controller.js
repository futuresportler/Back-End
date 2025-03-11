const userService = require("../../services/user/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { verifyAndExtractUser } = require("../../config/otp");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    successResponse(res, { message: "Users fetched" }, users);
  } catch (error) {
    errorResponse(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return errorResponse(res, { message: "User not found" }, 404);
    successResponse(res, { message: "Users fetched" }, user);
  } catch (error) {
    errorResponse(res, error);
  }
};

const signup = async (req, res) => {
  try {
    const newUser = await userService.signUp(req.body);
    successResponse(res, { message: "User created" }, newUser, 201);
  } catch (error) {
    errorResponse(
      res,
      { message: error.message || "User signup failed" },
      error
    );
  }
};

const signin = async (req, res) => {
  try {
    const user = await userService.signIn(req.body);
    successResponse(res, "User logged in successfully", user);
  } catch (error) {
    errorResponse(
      res,
      { message: error.message || "User signin failed" },
      error
    );
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      errorResponse(res, { message: "Refresh token required" }, 400);
    }

    const tokens = await userService.refreshToken(refreshToken);
    successResponse(res, { message: "Token refreshed" }, tokens);
  } catch (error) {
    errorResponse(
      res,
      { message: error.message || "User signin failed" },
      error
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    if (!updatedUser) errorResponse(res, { message: "User not found" }, 404);
    successResponse(res, updatedUser);
  } catch (error) {
    errorResponse(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await userService.deleteUser(req.params.id);
    if (!deletedUser)
      errorResponse(res, { message: "User not found" }, null, 404);
    successResponse(res, { message: "User deleted successfully" });
  } catch (error) {
    errorResponse(res, error);
  }
};

const verifyTokenAndUpdateUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Step 1: Verify Token & Extract Data
    const { mobileNumber } = await verifyAndExtractUser(idToken);

    // Step 2: Fetch user by email
    const user = await userService.getUserByMobile(mobileNumber);
    if (!user) errorResponse(res, { message: "User not found" }, user, 404);

    // Step 3: Add mobile number if missing
    const updatedUser = await userService.updateUser(user.user_id, {
      mobileNumber,
      is_verified: true,
    });

    successResponse(
      res,
      { message: "User verified successfully" },
      updatedUser
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await userService.requestOTP(email);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const response = await userService.verifyOTPCode(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  signup,
  signin,
  refreshToken,
  updateUser,
  deleteUser,
  verifyTokenAndUpdateUser,
  requestOTP,
  verifyOTP,
};
