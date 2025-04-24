const { TurfGround, TurfSlot, TurfReview, User, sequelize } = require("../../../database")
const { Op } = require("sequelize")

const findGroundById = async (groundId) => {
  return await TurfGround.findByPk(groundId, {
    include: ["turf"],
  })
}

const findGroundsByTurfId = async (turfId) => {
  return await TurfGround.findAll({
    where: { turfId },
    include: ["slots", "reviews"],
  })
}

const createGround = async (groundData) => {
  return await TurfGround.create(groundData)
}

const updateGround = async (groundId, updateData) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  return await ground.update(updateData)
}

const deleteGround = async (groundId) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  await ground.destroy()
  return ground
}

const getGroundSlots = async (groundId, startDate, endDate) => {
  const whereClause = { groundId }

  if (startDate && endDate) {
    whereClause.startTime = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    }
  }

  return await TurfSlot.findAll({
    where: whereClause,
    order: [["startTime", "ASC"]],
  })
}

const createSlot = async (slotData) => {
  return await TurfSlot.create(slotData)
}

const updateSlot = async (slotId, updateData) => {
  const slot = await TurfSlot.findByPk(slotId)
  if (!slot) return null
  return await slot.update(updateData)
}

const deleteSlot = async (slotId) => {
  const slot = await TurfSlot.findByPk(slotId)
  if (!slot) return null
  await slot.destroy()
  return slot
}

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

module.exports = {
  findGroundById,
  findGroundsByTurfId,
  createGround,
  updateGround,
  deleteGround,
  getGroundSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  getGroundReviews,
  getGroundStats,
}
