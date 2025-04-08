const { turfService } = require("../../services/turf");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const createProfile = async (req, res) => {
  try {
    const profile = await turfService.createTurfProfile(
      req.user.supplierId,
      req.body
    );
    successResponse(res, "Turf profile created", profile, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getMyProfiles = async (req, res) => {
  try {
    const profiles = await turfService.getTurfsBySupplier(req.user.supplierId);
    successResponse(res, "Turf profiles fetched", profiles);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await turfService.getTurfProfile(req.params.turfProfileId);
    successResponse(res, "Turf profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await turfService.updateTurfProfile(
      req.params.turfProfileId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await turfService.deleteTurfProfile(req.params.turfProfileId);
    successResponse(res, "Profile deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNearbyTurfs = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const turfs = await turfService.getNearbyTurfs(latitude, longitude, radius);
    successResponse(res, "Nearby turfs fetched", turfs);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const addImage = async (req, res) => {
  try {
    const updated = await turfService.addTurfImage(
      req.params.turfProfileId,
      req.body.imageUrl
    );
    successResponse(res, "Image added", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  createProfile,
  getMyProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyTurfs,
  addImage,
};
