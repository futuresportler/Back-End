const userRepository = require("./repositories/userRepository");
const { generateTokens, verifyRefreshToken } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");

const getAllUsers = async () => {
  return await userRepository.findAll();
};

const getUserById = async (userId) => {
  return await userRepository.findById(userId);
};

const getUserByMobile = async (mobile) => {
  return await userRepository.findByMobile(mobile);
};

const signUp = async (userData) => {
  const { mobile, password, ...otherData } = userData;

  // Check if user exists
  const existingUser = await userRepository.findByMobile(mobile);
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
    mobile,
    password: hashedPassword,
    ...otherData,
  });

  setTimeout(async () => {
    const user = await userRepository.findById(newUser.user_id);
    if (user && !user.is_verified) {
      await userRepository.deleteUser(user.user_id);
      warn(
        `User with mobile number ${user.mobile} deleted due to non-verification.`
      );
    }
  }, 1 * 10 * 1000); // 2 minute in milliseconds

  // Generate tokens
  const tokens = generateTokens(newUser);
  return { user: newUser, tokens };
};

const signIn = async (data) => {
  const { mobile, password: passwordRaw } = data;
  // Find user
  const user = await userRepository.findByMobile(mobile);
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

const requestOTP = async (email) => {
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
};

const verifyOTPCode = async (email, otp) => {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  // await userRepository.updateUser(user_id, { email });
  return { message: "OTP verified successfully!" };
};


module.exports = {
  getAllUsers,
  getUserById,
  getUserByMobile,
  signUp,
  signIn,
  refreshToken,
  updateUser,
  deleteUser,
  requestOTP,
  verifyOTPCode,
};
