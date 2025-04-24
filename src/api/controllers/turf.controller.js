const { turfService } = require("../../services/turf")
const { successResponse, errorResponse } = require("../../common/utils/response")

const createProfile = async (req, res) => {
  try {
    const profile = await turfService.createTurfProfile(req.user.supplierId, req.body)
    successResponse(res, "Turf profile created", profile, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getMyProfiles = async (req, res) => {
  try {
    const profiles = await turfService.getTurfsBySupplier(req.user.supplierId)
    successResponse(res, "Turf profiles fetched", profiles)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getProfile = async (req, res) => {
  try {
    const profile = await turfService.getTurfProfile(req.params.turfProfileId)
    successResponse(res, "Turf profile fetched", profile)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const updateProfile = async (req, res) => {
  try {
    const updated = await turfService.updateTurfProfile(req.params.turfProfileId, req.body)
    successResponse(res, "Profile updated", updated)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const deleteProfile = async (req, res) => {
  try {
    await turfService.deleteTurfProfile(req.params.turfProfileId)
    successResponse(res, "Profile deleted", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getNearbyTurfs = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query
    const turfs = await turfService.getNearbyTurfs(latitude, longitude, radius)
    successResponse(res, "Nearby turfs fetched", turfs)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const addImage = async (req, res) => {
  try {
    const { imageUrl, isMainImage } = req.body
    const updated = await turfService.addTurfImage(req.params.turfProfileId, imageUrl, isMainImage)
    successResponse(res, "Image added", updated)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getDashboard = async (req, res) => {
  try {
    const dashboard = await turfService.getTurfDashboard(req.params.turfProfileId)
    successResponse(res, "Dashboard data fetched", dashboard)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const handleBookingRequest = async (req, res) => {
  try {
    const { action } = req.body
    const updated = await turfService.handleBookingRequest(req.params.requestId, action)
    successResponse(res, `Booking request ${action}ed`, updated)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const addReview = async (req, res) => {
  try {
    const review = await turfService.addReview(req.params.turfProfileId, req.user.userId, req.body)
    successResponse(res, "Review added", review, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

// Ground-related controller methods
const createGround = async (req, res) => {
  try {
    const ground = await turfService.createTurfGround(req.params.turfProfileId, req.body)
    successResponse(res, "Turf ground created", ground, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGrounds = async (req, res) => {
  try {
    const grounds = await turfService.getTurfGrounds(req.params.turfProfileId)
    successResponse(res, "Turf grounds fetched", grounds)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGround = async (req, res) => {
  try {
    const ground = await turfService.getTurfGround(req.params.groundId)
    successResponse(res, "Turf ground fetched", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const updateGround = async (req, res) => {
  try {
    const updated = await turfService.updateTurfGround(req.params.groundId, req.body)
    successResponse(res, "Ground updated", updated)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const deleteGround = async (req, res) => {
  try {
    await turfService.deleteTurfGround(req.params.groundId)
    successResponse(res, "Ground deleted", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

module.exports = {
  createProfile,
  getMyProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getNearbyTurfs,
  addImage,
  getDashboard,
  handleBookingRequest,
  addReview,
  // Ground-related controller methods
  createGround,
  getGrounds,
  getGround,
  updateGround,
  deleteGround,
}
