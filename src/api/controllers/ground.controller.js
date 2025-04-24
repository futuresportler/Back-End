const { groundService } = require("../../services/turf")
const { successResponse, errorResponse } = require("../../common/utils/response")

/**
 * Create a new ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGround = async (req, res) => {
  try {
    const ground = await groundService.createGround(req.params.turfId, req.body)
    successResponse(res, "Ground created successfully", ground, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Get a ground by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGround = async (req, res) => {
  try {
    const ground = await groundService.getGround(req.params.groundId)
    successResponse(res, "Ground fetched successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Get all grounds for a turf
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroundsByTurf = async (req, res) => {
  try {
    const grounds = await groundService.getGroundsByTurf(req.params.turfId)
    successResponse(res, "Grounds fetched successfully", grounds)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Update a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGround = async (req, res) => {
  try {
    const ground = await groundService.updateGround(req.params.groundId, req.body)
    successResponse(res, "Ground updated successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Delete a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteGround = async (req, res) => {
  try {
    await groundService.deleteGround(req.params.groundId)
    successResponse(res, "Ground deleted successfully", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Add an image to a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addGroundImage = async (req, res) => {
  try {
    const { imageUrl, isMainImage } = req.body
    const ground = await groundService.addGroundImage(req.params.groundId, imageUrl, isMainImage)
    successResponse(res, "Image added successfully", ground)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Get slots for a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroundSlots = async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const slots = await groundService.getGroundSlots(req.params.groundId, startDate, endDate)
    successResponse(res, "Slots fetched successfully", slots)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Create a slot for a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSlot = async (req, res) => {
  try {
    const slot = await groundService.createSlot(req.params.groundId, req.body)
    successResponse(res, "Slot created successfully", slot, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Update a slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateSlot = async (req, res) => {
  try {
    const slot = await groundService.updateSlot(req.params.slotId, req.body)
    successResponse(res, "Slot updated successfully", slot)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Delete a slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteSlot = async (req, res) => {
  try {
    await groundService.deleteSlot(req.params.slotId)
    successResponse(res, "Slot deleted successfully", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Get reviews for a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroundReviews = async (req, res) => {
  try {
    const reviews = await groundService.getGroundReviews(req.params.groundId)
    successResponse(res, "Reviews fetched successfully", reviews)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Get dashboard data for a ground
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroundDashboard = async (req, res) => {
  try {
    const dashboard = await groundService.getGroundDashboard(req.params.groundId)
    successResponse(res, "Ground dashboard fetched successfully", dashboard)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Generate slots for a ground for a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateSlotsForDate = async (req, res) => {
  try {
    const { date } = req.body
    if (!date) {
      return errorResponse(res, "Date is required", null, 400)
    }

    const slots = await groundService.generateSlotsForDate(req.params.groundId, date)
    successResponse(res, "Slots generated successfully", slots, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Book a slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const bookSlot = async (req, res) => {
  try {
    const slot = await groundService.bookSlot(req.params.slotId, req.user.userId)
    successResponse(res, "Slot booked successfully", slot)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Cancel a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelBooking = async (req, res) => {
  try {
    const slot = await groundService.cancelBooking(req.params.slotId, req.user.userId)
    successResponse(res, "Booking cancelled successfully", slot)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

/**
 * Update payment status for a slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body
    if (!status) {
      return errorResponse(res, "Payment status is required", null, 400)
    }

    const slot = await groundService.updatePaymentStatus(req.params.slotId, status)
    successResponse(res, "Payment status updated successfully", slot)
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
  generateSlotsForDate,
  bookSlot,
  cancelBooking,
  updatePaymentStatus,
}
