const { academyService } = require("../../services/academy");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const createProfile = async (req, res) => {
  try {
    const profile = await academyService.createAcademyProfile(
      req.user.supplierId,
      req.body
    );
    successResponse(res, "Academy profile created", profile, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getMyProfiles = async (req, res) => {
  try {
    const profiles = await academyService.getAcademiesBySupplier(
      req.user.supplierId
    );
    successResponse(res, "Academy profiles fetched", profiles);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await academyService.getAcademyProfile(
      req.params.academyProfileId
    );
    successResponse(res, "Academy profile fetched", profile);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await academyService.updateAcademyProfile(
      req.params.academyProfileId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    await academyService.deleteAcademyProfile(req.params.academyProfileId);
    successResponse(res, "Profile deleted", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNearbyAcademies = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const academies = await academyService.getNearbyAcademies(
      latitude,
      longitude,
      radius
    );
    successResponse(res, "Nearby academies fetched", academies);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const addSport = async (req, res) => {
  try {
    const updated = await academyService.addAcademySport(
      req.params.academyProfileId,
      req.body.sportId
    );
    successResponse(res, "Sport added", updated);
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
  getNearbyAcademies,
  addSport,
};
