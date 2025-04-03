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

const getAllAcademies = async (req, res) => {
  try {
    let { page, limit, latitude, longitude } = req.query;

    // If user is logged in, we can potentially get their location
    if (req.user && (!latitude || !longitude)) {
      // Assuming there's a userService or similar way to get user data
      const user = await userService.getUserById(req.user.userId);
      if (user) {
        latitude = user.latitude;
        longitude = user.longitude;
      }
    }

    const academies = await AcademyService.getAllAcademies({
      page,
      limit,
      latitude,
      longitude,
    });
    successResponse(res, "All academies fetched", academies);
  } catch (error) {
    fatal(error);
    errorResponse(
      res,
      error.message || "Get All Academies Failed",
      error,
      error.statusCode || 500
    );
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
