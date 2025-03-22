const coachRepository = require("./repositories/coachRepository");
const { generateCoachTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");
const admin = require("firebase-admin");
const db = require("../../database/index");

const getCoachById = async (coachId) => {
  return await coachRepository.findById(coachId);
};

const getCoachByEmail = async (email) => {
  return await coachRepository.findByEmail(email);
};

const getCoachByMobile = async (mobileNumber) => {
  return await coachRepository.findByMobile(mobileNumber);
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
  const isMatch = await comparePassword(passwordRaw, coach.password);
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

  const coach = await getCoachByEmail(email);
  if (!coach) {
    const error = new Error("coach not found");
    error.statusCode = 404;
    throw error;
  }
  await updateCoach(coach.coachId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const coach = await getCoachByEmail(email);
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

  const coach = await getCoachByEmail(email);
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
  await updateCoach(coachId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

const handleOAuth = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const { email, name, picture, uid } = decodedToken;

    const displayName = name || email.split("@")[0];
    const nameParts = displayName.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    let coach = await coachRepository.findByEmail(email);

    if (coach) {
      if (!coach.isOAuth) {
        coach = await coachRepository.updateCoach(coach.coachId, {
          isOAuth: true,
          firebaseUID: uid,
        });
      }
    } else {
      coach = await coachRepository.createCoach({
        email,
        first_name,
        last_name,
        profile_picture: picture || null,
        isOAuth: true,
        isVerified: true,
        firebaseUID: uid,
      });
    }

    const tokens = generateCoachTokens(coach);
    return { coach, tokens };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    throw new Error("Invalid or expired authentication token");
  }
};

const createCoach = async (coachData) => {
  return await coachRepository.createCoach(coachData);
};

const getAllCoaches = async () => {
  return await coachRepository.findAll();
};

const addReview = async (reviewData) => {
  // Verify that the coach exists
  const coach = await coachRepository.findById(reviewData.entity_id);
  if (!coach) {
    const error = new Error("Coach not found");
    error.statusCode = 404;
    throw error;
  }

  // Create the review
  const newReview = await db.Review.create(reviewData);

  // Update the coach's review_ids array if it exists
  if (coach.review_ids) {
    const updatedReviewIds = [...coach.review_ids, newReview.review_id];
    await coachRepository.updateCoach(coach.coachId, {
      review_ids: updatedReviewIds,
    });
  } else {
    await coachRepository.updateCoach(coach.coachId, {
      review_ids: [newReview.review_id],
    });
  }

  return newReview;
};

const updateReview = async (reviewId, updateData) => {
  // Find the review first
  const review = await db.Review.findByPk(reviewId);
  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership - ensure the user updating the review is the one who created it
  if (review.reviewer_id !== updateData.reviewer_id) {
    const error = new Error(
      "Unauthorized: You can only update your own reviews"
    );
    error.statusCode = 403;
    throw error;
  }

  // Verify that the review belongs to the specified coach
  if (
    review.entity_id !== updateData.entity_id ||
    review.entity_type !== "Coach"
  ) {
    const error = new Error("Review does not match the specified coach");
    error.statusCode = 400;
    throw error;
  }

  // Update only allowed fields
  const allowedUpdates = ["rating", "comment"];
  const filteredUpdates = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  // Update the review
  await review.update(filteredUpdates);

  return review;
};

module.exports = {
  getCoachById,
  getCoachByEmail,
  getCoachByMobile,
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
  handleOAuth,
  createCoach,
  getAllCoaches,
  addReview,
  updateReview,
};
