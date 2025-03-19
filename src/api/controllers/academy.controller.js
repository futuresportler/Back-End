const AcademyService = require("../../services/academy/index");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
// const { verifyAndExtractAcademy } = require("../../config/otp");
const { fatal } = require("../../config/logging");

const getAcademyById = async (req, res) => {
  try {
    const academy = await AcademyService.getAcademyById(req.user.academyId);
    if (!academy) return errorResponse(res, "Academy not found", 404);
    successResponse(res, "Academy fetched", academy);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const signup = async (req, res) => {
  try {
    const newAcademy = await AcademyService.signUp(req.body);
    successResponse(res, "Academy created", newAcademy, 201);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Academy signup failed", error);
  }
};

const signin = async (req, res) => {
  try {
    const academy = await AcademyService.signIn(req.body);
    successResponse(res, "Academy logged in successfully", academy);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message || "Academy signin failed", error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await AcademyService.refreshToken(req.user.academyId);
    successResponse(res, "Token refreshed", { accessToken: tokens });
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Academy signin failed",
      error,
      error.statusCode
    );
  }
};

const updateAcademy = async (req, res) => {
  try {
    const updatedAcademy = await AcademyService.updateAcademy(
      req.user.academyId,
      req.body
    );
    if (!updatedAcademy) return errorResponse(res, "Academy not found", 404);
    successResponse(res, updatedAcademy);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

const deleteAcademy = async (req, res) => {
  try {
    const deletedAcademy = await AcademyService.deleteAcademy(req.user.academyId);
    if (!deletedAcademy) return errorResponse(res, "Academy not found", null, 404);
    successResponse(res, "Academy deleted successfully", null, 204);
  } catch (error) {
    fatal(error);
    errorResponse(res, error);
  }
};

// const verifyTokenAndUpdateAcademy = async (req, res) => {
//   try {
//     const { idToken } = req.body;

//     // Step 1: Verify Token & Extract Data
//     const { mobileNumber } = await verifyAndExtractAcademy(idToken);

//     // Step 2: Fetch academy by email
//     const academy = await AcademyService.getAcademyByMobile(mobileNumber);
//     if (!academy) errorResponse(res, "Academy not found", academy, 404);

//     // Step 3: Add mobile number if missing
//     const updatedAcademy = await AcademyService.updateAcademy(academy.academyId, {
//       mobileNumber,
//       isVerified: true,
//     });

//     successResponse(res, "Academy verified successfully", updatedAcademy);
//   } catch (error) {
//     errorResponse(res, error.message, error);
//   }
// };

const requestOTP = async (req, res) => {
  try {
    const email = req.user.email;
    const response = await AcademyService.requestOTP(email);
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
    const response = await AcademyService.verifyOTPCode(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await AcademyService.forgotPassword(email);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const forgotPasswordOTPVerify = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const response = await AcademyService.forgotPasswordOTPVerify(email, otp);
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const response = await AcademyService.resetPassword(
      req.user.academyId,
      password
    );
    successResponse(res, response.message, response);
  } catch (error) {
    fatal(error);
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  getAcademyById,
  signup,
  signin,
  refreshToken,
  updateAcademy,
  deleteAcademy,
  // verifyTokenAndUpdateAcademy,
  requestOTP,
  verifyOTP,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
};
