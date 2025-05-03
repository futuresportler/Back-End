const userRepository = require("./repositories/userRepository");
const { generateTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");
const firebase = require("../../config/firebase");

const getUserById = async (userId) => {
  return await userRepository.findById(userId);
};

const getUserByEmail = async (email) => {
  return await userRepository.findByEmail(email);
};

const getUserByMobile = async (mobileNumber) => {
  return await userRepository.findByMobile(mobileNumber);
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
    ...otherData,
  });

  setTimeout(async () => {
    const user = await userRepository.findById(newUser.userId);
    if (user && !user.isVerified) {
      await userRepository.deleteUser(user.userId);
      warn(`User with Email ${user.email} deleted due to non-verification.`);
    }
  }, 10 * 60 * 1000); // 2 minute in milliseconds

  // Generate tokens
  const tokens = generateTokens(newUser);
  return { tokens };
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
  const isMatch = await comparePassword(passwordRaw, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const tokens = generateTokens(user);

  return tokens;
};

const refreshToken = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user);
  return accessToken;
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

  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await updateUser(user.userId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
};

const forgotPasswordOTPVerify = async (email, otp) => {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await updateUser(user.userId, { isVerified: true });
  const tokens = generateTokens(user);
  return { tokens };
};

const resetPassword = async (userId, password) => {
  const hashedPassword = await hashPassword(password);
  await updateUser(userId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

const handleOAuth = async (idToken) => {
  try {
    const decodedToken = await firebase.verifyIdToken(idToken);

    const { email, name, picture, uid } = decodedToken;

    const displayName = name || email.split("@")[0];
    const nameParts = displayName.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    let user = await userRepository.findByEmail(email);

    if (user) {
      if (!user.isOAuth) {
        user = await userRepository.updateUser(user.userId, {
          isOAuth: true,
          firebaseUID: uid,
        });
      }
    } else {
      user = await userRepository.createUser({
        email,
        first_name,
        last_name,
        profile_picture: picture || null,
        isOAuth: true,
        isVerified: true,
        firebaseUID: uid,
      });
    }

    const tokens = generateTokens(user);
    return { user, tokens };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    throw new Error("Invalid or expired authentication token");
  }
};

const createUser = async (userData) => {
  return await userRepository.createUser(userData);
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByMobile,
  signUp,
  signIn,
  refreshToken,
  updateUser,
  deleteUser,
  requestOTP,
  verifyOTPCode,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  handleOAuth,
  createUser, 
};
