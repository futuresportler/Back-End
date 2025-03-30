const academyRepository = require("./repositories/academyRepository");
const { generateAcademyTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");

const getAcademyById = async (academyId) => {
  return await academyRepository.findById(academyId);
};

const getAcademyByEmail = async (email) => {
  return await academyRepository.findByEmail(email);
};

const signUp = async (academyData) => {
  const { email, password, ...otherData } = academyData;

  // Check if academy exists
  const existingacademy = await academyRepository.findByEmail(email);
  if (existingacademy) {
    const error = new Error("academy already exists");
    error.statusCode = 400;
    error.message = "academy already exists";
    throw error;
  }
  // Hash password
  const hashedPassword = await hashPassword(password);
  // Create academy
  const newacademy = await academyRepository.createAcademy({
    email,
    password: hashedPassword,
    ...otherData,
  });

  setTimeout(async () => {
    const academy = await academyRepository.findById(newacademy.academyId);
    if (academy && !academy.isVerified) {
      await academyRepository.deleteAcademy(academy.academyId);
      warn(
        `academy with Email ${academy.email} deleted due to non-verification.`
      );
    }
  }, 10 * 60 * 1000); // 2 minute in milliseconds

  // Generate tokens
  const tokens = generateAcademyTokens(newacademy);
  return { tokens };
};

const signIn = async (data) => {
  const { email, password: passwordRaw } = data;
  // Find academy
  const academy = await academyRepository.findByEmail(email);
  if (!academy) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    error.message = "Invalid Credentials";
    throw error;
  }
  // Compare passwords
  const isMatch = await comparePassword(passwordRaw, academy.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const tokens = generateAcademyTokens(academy);

  return tokens;
};

const refreshToken = async (academyId) => {
  const academy = await academyRepository.findById(academyId);
  if (!academy) {
    const error = new Error("academy not found");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = generateAcademyTokens(academy);
  return accessToken;
};

const updateAcademy = async (academyId, updateData) => {
  return await academyRepository.updateAcademy(academyId, updateData);
};

const deleteAcademy = async (academyId) => {
  return await academyRepository.deleteAcademy(academyId);
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

  const academy = await getAcademyByEmail(email);
  if (!academy) {
    const error = new Error("academy not found");
    error.statusCode = 404;
    throw error;
  }
  await updateAcademy(academy.academyId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const academy = await getAcademyByEmail(email);
  if (!academy) {
    const error = new Error("academy not found");
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

  const academy = await getAcademyByEmail(email);
  if (!academy) {
    const error = new Error("academy not found");
    error.statusCode = 404;
    throw error;
  }

  await updateAcademy(academy.academyId, { isVerified: true });
  const tokens = generateAcademyTokens(academy);
  return { tokens };
};

const resetPassword = async (academyId, password) => {
  const hashedPassword = await hashPassword(password);
  await updateAcademy(academyId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

const getAllAcademies = async ({
  page = 1,
  limit = 10,
  latitude,
  longitude,
}) => {
  return await academyRepository.findAll({ page, limit, latitude, longitude });
};

module.exports = {
  getAcademyById,
  getAcademyByEmail,
  signUp,
  signIn,
  refreshToken,
  updateAcademy,
  deleteAcademy,
  requestOTP,
  verifyOTPCode,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  getAllAcademies,
};
