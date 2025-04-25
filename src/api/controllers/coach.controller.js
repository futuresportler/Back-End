const coachService = require("../../services/coach");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const getMyProfile = async (req, res) => {
  try {
    const profile = await coachService.getCoachBySupplier(req.user.supplierId);
    successResponse(res, "Coach profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await coachService.getCoachProfile(
      req.params.coachProfileId
    );
    successResponse(res, "Coach profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await coachService.updateCoachProfile(
      req.params.coachProfileId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await coachService.deleteCoachProfile(req.params.coachProfileId);
    successResponse(res, "Profile deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNearbyCoaches = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const coaches = await coachService.getNearbyCoaches(
      latitude,
      longitude,
      radius
    );
    successResponse(res, "Nearby coaches fetched", coaches);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const addCertification = async (req, res) => {
  try {
    const updated = await coachService.addCoachCertification(
      req.params.coachProfileId,
      req.body
    );
    successResponse(res, "Certification added", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  getMyProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyCoaches,
  addCertification,
};
