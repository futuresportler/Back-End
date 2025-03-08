const userService = require("../../services/user/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

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

module.exports = {
  getAllUsers,
  getUserById,
  signup,
  signin,
  refreshToken,
  updateUser,
  deleteUser,
};
