const turfRepository = require("./repositories/turfRepository");
const { generateTurfTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");
const firebase = require("../../config/firebase");
const db = require("../../database/index");

const getTurfById = async (turfId) => {
  return await turfRepository.findById(turfId);
};

const getTurfByEmail = async (email) => {
  return await turfRepository.findByEmail(email);
};

const getTurfByMobile = async (mobileNumber) => {
  return await turfRepository.findByMobile(mobileNumber);
};

const getAllTurfs = async (options) => {
  return await turfRepository.findAll(options);
};

const signUp = async (turfData) => {
  const { email, password, ...otherData } = turfData;

  // Check if turf exists
  const existingTurf = await turfRepository.findByEmail(email);
  if (existingTurf) {
    const error = new Error("Turf already exists");
    error.statusCode = 400;
    error.message = "Turf already exists";
    throw error;
  }
  // Hash password
  const hashedPassword = await hashPassword(password);
  // Create turf
  const newTurf = await turfRepository.createTurf({
    email,
    password: hashedPassword,
    ...otherData,
  });

  setTimeout(async () => {
    const turf = await turfRepository.findById(newTurf.turfId);
    if (turf && !turf.isVerified) {
      await turfRepository.deleteTurf(turf.turfId);
      warn(`Turf with Email ${turf.email} deleted due to non-verification.`);
    }
  }, 10 * 60 * 1000); // 10 minutes in milliseconds

  // Generate tokens
  const tokens = generateTurfTokens(newTurf);
  return { tokens };
};

const signIn = async (data) => {
  const { email, password: passwordRaw } = data;
  // Find turf
  const turf = await turfRepository.findByEmail(email);
  if (!turf) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    error.message = "Invalid Credentials";
    throw error;
  }
  // Compare passwords
  const isMatch = await comparePassword(passwordRaw, turf.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const tokens = generateTurfTokens(turf);

  return tokens;
};

const refreshToken = async (turfId) => {
  const turf = await turfRepository.findById(turfId);
  if (!turf) {
    const error = new Error("Turf not found");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = generateTurfTokens(turf);
  return accessToken;
};

const updateTurf = async (turfId, updateData) => {
  return await turfRepository.updateTurf(turfId, updateData);
};

const deleteTurf = async (turfId) => {
  return await turfRepository.deleteTurf(turfId);
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

  const turf = await getTurfByEmail(email);
  if (!turf) {
    const error = new Error("Turf not found");
    error.statusCode = 404;
    throw error;
  }
  await updateTurf(turf.turfId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const turf = await getTurfByEmail(email);
  if (!turf) {
    const error = new Error("Turf not found");
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

  const turf = await getTurfByEmail(email);
  if (!turf) {
    const error = new Error("Turf not found");
    error.statusCode = 404;
    throw error;
  }

  await updateTurf(turf.turfId, { isVerified: true });
  const tokens = generateTurfTokens(turf);
  return { tokens };
};

const resetPassword = async (turfId, password) => {
  const hashedPassword = await hashPassword(password);
  await updateTurf(turfId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

const addComment = async (commentData) => {
  // Verify that the turf exists
  const turf = await turfRepository.findById(commentData.entity_id);
  if (!turf) {
    const error = new Error("Turf not found");
    error.statusCode = 404;
    throw error;
  }

  // Create the review/comment
  const newReview = await db.Review.create({
    ...commentData,
    entity_type: "Turf",
  });

  // Update the turf's review_ids array if it exists
  if (turf.review_ids) {
    const updatedReviewIds = [...turf.review_ids, newReview.review_id];
    await turfRepository.updateTurf(turf.turfId, {
      review_ids: updatedReviewIds,
    });
  } else {
    await turfRepository.updateTurf(turf.turfId, {
      review_ids: [newReview.review_id],
    });
  }

  return newReview;
};

const updateComment = async (reviewId, updateData) => {
  // Find the review first
  const review = await db.Review.findByPk(reviewId);
  if (!review) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership - ensure the user updating the review is the one who created it
  if (review.reviewer_id !== updateData.reviewer_id) {
    const error = new Error(
      "Unauthorized: You can only update your own comments"
    );
    error.statusCode = 403;
    throw error;
  }

  // Verify that the review belongs to the specified turf
  if (
    review.entity_id !== updateData.entity_id ||
    review.entity_type !== "Turf"
  ) {
    const error = new Error("Comment does not match the specified turf");
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

const deleteComment = async (reviewId, userId) => {
  // Find the review first
  const review = await db.Review.findByPk(reviewId);
  if (!review) {
    const error = new Error("Comment not found");
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership - ensure the user deleting the review is the one who created it
  if (review.reviewer_id !== userId) {
    const error = new Error(
      "Unauthorized: You can only delete your own comments"
    );
    error.statusCode = 403;
    throw error;
  }

  // Check if this review belongs to a turf
  if (review.entity_type !== "Turf") {
    const error = new Error("Comment does not belong to a turf");
    error.statusCode = 400;
    throw error;
  }

  // Get the turf to update its review_ids array
  const turf = await turfRepository.findById(review.entity_id);
  if (turf && turf.review_ids) {
    const updatedReviewIds = turf.review_ids.filter(
      (id) => id !== review.review_id
    );
    await turfRepository.updateTurf(turf.turfId, {
      review_ids: updatedReviewIds,
    });
  }

  // Delete the review
  await review.destroy();

  return { message: "Comment deleted successfully" };
};

const bookTurf = async (bookingData) => {
  // Placeholder for future implementation
  return {
    message: "Turf booking functionality will be implemented soon",
    bookingData,
  };
};

const getTurfCalendar = async (turfId) => {
  // Placeholder for future implementation
  return {
    message: "Turf calendar functionality will be implemented soon",
    turfId,
  };
};

module.exports = {
  getTurfById,
  getTurfByEmail,
  getTurfByMobile,
  getAllTurfs,
  signUp,
  signIn,
  refreshToken,
  updateTurf,
  deleteTurf,
  requestOTP,
  verifyOTPCode,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  addComment,
  updateComment,
  deleteComment,
  bookTurf,
  getTurfCalendar,
};
