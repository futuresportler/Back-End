const { TurfProfile, Supplier, sequelize, TurfReview, User, TurfSlot, SlotRequest } = require("../../../database")
const { Op } = require("sequelize")

const findTurfProfileById = async (turfProfileId) => {
  return await TurfProfile.findByPk(turfProfileId, {
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile", "profilePicture", "location"],
      },
    ],
  })
}

const findTurfsBySupplierId = async (supplierId) => {
  return await TurfProfile.findAll({
    where: { supplierId },
    include: ["supplier"],
  })
}

const createTurfProfile = async (profileData) => {
  return await TurfProfile.create(profileData)
}

const updateTurfProfile = async (turfProfileId, updateData) => {
  const profile = await TurfProfile.findByPk(turfProfileId)
  if (!profile) return null
  return await profile.update(updateData)
}

const deleteTurfProfile = async (turfProfileId) => {
  const profile = await TurfProfile.findByPk(turfProfileId)
  if (!profile) return null
  await profile.destroy()
  return profile
}

const findTurfsNearby = async (latitude, longitude, radius) => {
  return await TurfProfile.findAll({
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn("ST_SetSRID", sequelize.fn("ST_MakePoint", longitude, latitude), 4326),
            radius,
          ),
          true,
        ),
      },
    ],
  })
}

const getTurfQuickInfo = async (turfId) => {
  // Get total bookings, revenue, utilization, etc.
  const totalBookings = await TurfSlot.count({
    where: { turfId, status: "booked" },
  })

  const totalRevenue = await TurfSlot.sum("price", {
    where: { turfId, status: "booked", paymentStatus: "confirmed" },
  })

  // Calculate utilization (booked slots / total slots)
  const totalSlots = await TurfSlot.count({ where: { turfId } })
  const utilization = totalSlots > 0 ? (totalBookings / totalSlots) * 100 : 0

  return {
    totalBookings,
    totalRevenue: totalRevenue || 0,
    utilization: Math.round(utilization),
  }
}

const getUpcomingBookings = async (turfId, limit = 5) => {
  return await TurfSlot.findAll({
    where: {
      turfId,
      status: "booked",
      startTime: { [Op.gte]: new Date() },
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
    ],
    order: [["startTime", "ASC"]],
    limit,
  })
}

const getTodaySchedule = async (turfId) => {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  return await TurfSlot.findAll({
    where: {
      turfId,
      startTime: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name"],
      },
    ],
    order: [["startTime", "ASC"]],
  })
}

const getBookingRequests = async (turfId, limit = 5) => {
  return await SlotRequest.findAll({
    where: {
      turfId,
      status: "pending",
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  })
}

const getCustomerReviews = async (turfId, limit = 5) => {
  return await TurfReview.findAll({
    where: { turfId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "profilePicture"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  })
}

const updateBookingRequestStatus = async (requestId, status) => {
  const request = await SlotRequest.findByPk(requestId)
  if (!request) return null
  return await request.update({ status })
}

const addTurfReview = async (reviewData) => {
  const review = await TurfReview.create(reviewData)

  // Update turf rating
  const turf = await TurfProfile.findByPk(reviewData.turfId)
  const reviews = await TurfReview.findAll({ where: { turfId: reviewData.turfId } })

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length

  await turf.update({
    rating: averageRating,
    totalReviews: reviews.length,
  })

  return review
}

module.exports = {
  findTurfProfileById,
  findTurfsBySupplierId,
  createTurfProfile,
  updateTurfProfile,
  deleteTurfProfile,
  findTurfsNearby,
  getTurfQuickInfo,
  getUpcomingBookings,
  getTodaySchedule,
  getBookingRequests,
  getCustomerReviews,
  updateBookingRequestStatus,
  addTurfReview,
}
