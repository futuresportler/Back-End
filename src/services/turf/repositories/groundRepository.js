const { TurfGround, TurfSlot, TurfReview, User, sequelize, Day } = require("../../../database")
const { Op } = require("sequelize")

/**
 * Find a ground by ID
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Object>} - The ground
 */
const findGroundById = async (groundId) => {
  return await TurfGround.findByPk(groundId, {
    include: ["turfProfile"],
  })
}

/**
 * Find grounds by turf ID
 * @param {string} turfId - The ID of the turf
 * @returns {Promise<Array>} - Array of grounds
 */
const findGroundsByTurfId = async (turfId) => {
  return await TurfGround.findAll({
    where: { turfId },
    include: ["slots", "reviews"],
  })
}

/**
 * Create a ground
 * @param {Object} groundData - The ground data
 * @returns {Promise<Object>} - The created ground
 */
const createGround = async (groundData) => {
  return await TurfGround.create(groundData)
}

/**
 * Update a ground
 * @param {string} groundId - The ID of the ground
 * @param {Object} updateData - The update data
 * @returns {Promise<Object>} - The updated ground
 */
const updateGround = async (groundId, updateData) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  return await ground.update(updateData)
}

/**
 * Delete a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Object>} - The deleted ground
 */
const deleteGround = async (groundId) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  await ground.destroy()
  return ground
}

/**
 * Get slots for a ground
 * @param {string} groundId - The ID of the ground
 * @param {string} startDate - The start date (YYYY-MM-DD)
 * @param {string} endDate - The end date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of slots
 */
const getGroundSlots = async (groundId, startDate, endDate) => {
  const whereClause = { groundId }

  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate],
    }
  }

  return await TurfSlot.findAll({
    where: whereClause,
    include: [
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
  })
}

/**
 * Find a slot by ID
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<Object>} - The slot
 */
const findSlotById = async (slotId) => {
  return await TurfSlot.findByPk(slotId, {
    include: [
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
      },
    ],
  })
}

/**
 * Create a slot
 * @param {Object} slotData - The slot data
 * @returns {Promise<Object>} - The created slot
 */
const createSlot = async (slotData) => {
  return await TurfSlot.create(slotData)
}

/**
 * Update a slot
 * @param {string} slotId - The ID of the slot
 * @param {Object} updateData - The update data
 * @returns {Promise<Object>} - The updated slot
 */
const updateSlot = async (slotId, updateData) => {
  const slot = await TurfSlot.findByPk(slotId)
  if (!slot) return null
  return await slot.update(updateData)
}

/**
 * Delete a slot
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<Object>} - The deleted slot
 */
const deleteSlot = async (slotId) => {
  const slot = await TurfSlot.findByPk(slotId)
  if (!slot) return null
  await slot.destroy()
  return slot
}

/**
 * Get reviews for a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Array>} - Array of reviews
 */
const getGroundReviews = async (groundId) => {
  return await TurfReview.findAll({
    where: { groundId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "profilePicture"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
}

/**
 * Get stats for a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Object>} - Stats object
 */
const getGroundStats = async (groundId) => {
  // Get total bookings for this ground
  const totalBookings = await TurfSlot.count({
    where: { groundId, status: "booked" },
  })

  // Get total revenue for this ground
  const totalRevenue = await TurfSlot.sum("price", {
    where: { groundId, status: "booked", paymentStatus: "confirmed" },
  })

  // Calculate average rating for this ground
  const reviews = await TurfReview.findAll({
    where: { groundId },
    attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "averageRating"]],
  })

  const averageRating = reviews[0]?.getDataValue("averageRating") || 0

  return {
    totalBookings,
    totalRevenue: totalRevenue || 0,
    averageRating: Number.parseFloat(averageRating).toFixed(1),
  }
}

/**
 * Find a day by day number
 * @param {number} dayNumber - The day number (0-6, where 0 is Sunday)
 * @returns {Promise<Object>} - The day
 */
const findDayByNumber = async (dayNumber) => {
  return await Day.findOne({
    where: { dayNumber },
  })
}

module.exports = {
  findGroundById,
  findGroundsByTurfId,
  createGround,
  updateGround,
  deleteGround,
  getGroundSlots,
  findSlotById,
  createSlot,
  updateSlot,
  deleteSlot,
  getGroundReviews,
  getGroundStats,
  findDayByNumber,
}
