const {
  TurfProfile,
  Supplier,
  sequelize,
  TurfReview,
  User,
  TurfSlot,
  SlotRequest,
  TurfGround,
  Day,
} = require("../../../database")
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
  const today = new Date()

  return await TurfSlot.findAll({
    where: {
      turfId,
      status: "booked",
      date: { [Op.gte]: today.toISOString().split("T")[0] },
    },
    include: [
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
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
    limit,
  })
}

const getTodaySchedule = async (turfId) => {
  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0]

  return await TurfSlot.findAll({
    where: {
      turfId,
      date: formattedDate,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name"],
      },
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
      },
      {
        model: Day,
        as: "day",
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
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
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

// Ground-related repository methods
const createTurfGround = async (groundData) => {
  return await TurfGround.create(groundData)
}

const findGroundsByTurfId = async (turfId) => {
  return await TurfGround.findAll({
    where: { turfId },
    include: [
      {
        model: TurfProfile,
        as: "turfProfile",
        attributes: ["name"],
      },
    ],
  })
}

const findGroundById = async (groundId) => {
  return await TurfGround.findByPk(groundId, {
    include: [
      {
        model: TurfProfile,
        as: "turfProfile",
        attributes: ["name", "openingTime", "closingTime"],
      },
    ],
  })
}

const updateTurfGround = async (groundId, updateData) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  return await ground.update(updateData)
}

const deleteTurfGround = async (groundId) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  await ground.destroy()
  return ground
}

// Slot-related repository methods
const findSlotsByGroundAndDate = async (groundId, date) => {
  return await TurfSlot.findAll({
    where: {
      groundId,
      date,
    },
    include: [
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
    ],
    order: [["startTime", "ASC"]],
  })
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
  // Ground-related methods
  createTurfGround,
  findGroundsByTurfId,
  findGroundById,
  updateTurfGround,
  deleteTurfGround,
  // Slot-related methods
  findSlotsByGroundAndDate,
}
