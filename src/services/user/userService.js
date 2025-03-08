const userRepository = require("./repositories/userRepository");
const { generateTokens, verifyRefreshToken } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const getUserById = async (userId) => {
  return await userRepository.findById(userId);
};

const signUp = async (userData) => {
  const { email, password, ...otherData } = userData;

  // Check if user exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    error.message = "User already exists";
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  // Create user
  const newUser = await userRepository.createUser({
    email,
    password: hashedPassword,
    otherData,
  });

  // Generate tokens
  const tokens = generateTokens(newUser);
  return { user: newUser, tokens };
};


const signIn = async (data) => {

  const { email, password: passwordRaw } = data;
  // Find user
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    error.message = "Invalid Credentials";
    throw error;
  }
  // Compare passwords
  const isMatch = comparePassword(passwordRaw, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Remove password from response
  const { password, ...sanitizedUser } = user.get({ plain: true });

  // Generate tokens
  const tokens = generateTokens(sanitizedUser);

  return { user: sanitizedUser, tokens };
};

const refreshToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    error.message = "Invalid refresh token";
    throw error;
  }
  const user = await userRepository.findById(decoded.userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return generateTokens(user);
};


const updateUser = async (userId, updateData) => {
  return await userRepository.updateUser(userId, updateData);
};

const deleteUser = async (userId) => {
  return await userRepository.deleteUser(userId);
};

module.exports = {
  getAllUsers,
  getUserById,
  signUp,
  signIn,
  refreshToken,
  updateUser,
  deleteUser,
};
