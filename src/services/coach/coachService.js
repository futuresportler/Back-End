const coachRepository = require("./repositories/coachRepository");
const { generateCoachTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");

const getCoachById = async (coachId) => {
  return await coachRepository.findById(coachId);
};

const getCoachByEmail = async (email) => {
  return await coachRepository.findByEmail(email);
};

const signUp = async (coachData) => {
  const { email, password, ...otherData } = coachData;

  // Check if coach exists
  const existingcoach = await coachRepository.findByEmail(email);
  if (existingcoach) {
    const error = new Error("coach already exists");
    error.statusCode = 400;
    error.message = "coach already exists";
    throw error;
  }
  // Hash password
  const hashedPassword = await hashPassword(password);
  // Create coach
  const newcoach = await coachRepository.createCoach({
    email,
    password: hashedPassword,
    ...otherData,
  });

  setTimeout(async () => {
    const coach = await coachRepository.findById(newcoach.coachId);
    if (coach && !coach.isVerified) {
      await coachRepository.deleteCoach(coach.coachId);
      warn(`coach with Email ${coach.email} deleted due to non-verification.`);
    }
  }, 10 * 60 * 1000); // 2 minute in milliseconds

  // Generate tokens
  const tokens = generateCoachTokens(newcoach);
  return { tokens };
};

const signIn = async (data) => {
  const { email, password: passwordRaw } = data;
  // Find coach
  const coach = await coachRepository.findByEmail(email);
  if (!coach) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    error.message = "Invalid Credentials";
    throw error;
  }
  // Compare passwords
  const isMatch = comparePassword(passwordRaw, coach.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const tokens = generateCoachTokens(coach);

  return tokens;
};

const refreshToken = async (coachId) => {
  const coach = await coachRepository.findById(coachId);
  if (!coach) {
    const error = new Error("coach not found");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = generateCoachTokens(coach);
  return accessToken;
};

const updateCoach = async (coachId, updateData) => {
  return await coachRepository.updateCoach(coachId, updateData);
};

const deleteCoach = async (coachId) => {
  return await coachRepository.deleteCoach(coachId);
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

  const coach = await getcoachByEmail(email);
  if (!coach) {
    const error = new Error("coach not found");
    error.statusCode = 404;
    throw error;
  }
  await updatecoach(coach.coachId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const coach = await getcoachByEmail(email);
  if (!coach) {
    const error = new Error("coach not found");
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

  const coach = await getcoachByEmail(email);
  if (!coach) {
    const error = new Error("coach not found");
    error.statusCode = 404;
    throw error;
  }

  await updateCoach(coach.coachId, { isVerified: true });
  const tokens = generateCoachTokens(coach);
  return { tokens };
};

const resetPassword = async (coachId, password) => {
  const hashedPassword = await hashPassword(password);
  await updatecoach(coachId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

module.exports = {
  getCoachById,
  getCoachByEmail,
  signUp,
  signIn,
  refreshToken,
  updateCoach,
  deleteCoach,
  requestOTP,
  verifyOTPCode,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
};
