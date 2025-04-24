const { groundService } = require("../../services/turf")
const { successResponse, errorResponse } = require("../../common/utils/response")

const createGround = async (req, res) => {
  try {
    const ground = await groundService.createGround(req.params.turfId, req.body)
    successResponse(res, "Ground created successfully", ground, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGround = async (req, res) => {
  try {
    const ground = await groundService.getGround(req.params.groundId)
    successResponse(res, "Ground fetched successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGroundsByTurf = async (req, res) => {
  try {
    const grounds = await groundService.getGroundsByTurf(req.params.turfId)
    successResponse(res, "Grounds fetched successfully", grounds)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const updateGround = async (req, res) => {
  try {
    const ground = await groundService.updateGround(req.params.groundId, req.body)
    successResponse(res, "Ground updated successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const deleteGround = async (req, res) => {
  try {
    await groundService.deleteGround(req.params.groundId)
    successResponse(res, "Ground deleted successfully", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const addGroundImage = async (req, res) => {
  try {
    const { imageUrl, isMainImage } = req.body
    const ground = await groundService.addGroundImage(req.params.groundId, imageUrl, isMainImage)
    successResponse(res, "Image added successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGroundSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const slots = await groundService.getGroundSlots(req.params.groundId, startDate, endDate)
    successResponse(res, "Slots fetched successfully", slots)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const createSlot = async (req, res) => {
  try {
    const slot = await groundService.createSlot(req.params.groundId, req.body)
    successResponse(res, "Slot created successfully", slot, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const updateSlot = async (req, res) => {
  try {
    const slot = await groundService.updateSlot(req.params.slotId, req.body)
    successResponse(res, "Slot updated successfully", slot)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const deleteSlot = async (req, res) => {
  try {
    await groundService.deleteSlot(req.params.slotId)
    successResponse(res, "Slot deleted successfully", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGroundReviews = async (req, res) => {
  try {
    const reviews = await groundService.getGroundReviews(req.params.groundId)
    successResponse(res, "Reviews fetched successfully", reviews)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getGroundDashboard = async (req, res) => {
  try {
    const dashboard = await groundService.getGroundDashboard(req.params.groundId)
    successResponse(res, "Ground dashboard fetched successfully", dashboard)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

module.exports = {
  createGround,
  getGround,
  getGroundsByTurf,
  updateGround,
  deleteGround,
  addGroundImage,
  getGroundSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  getGroundReviews,
  getGroundDashboard,
}
