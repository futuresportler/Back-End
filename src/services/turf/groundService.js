const { TurfGround, TurfSlot, TurfReview, Day, User } = require("../../database")
const { Op } = require("sequelize")
const groundRepository = require("./repositories/groundRepository")
const turfRepository = require("./repositories/turfRepository")
const slotGenerationService = require("./slotGenerationService")
const { v4: uuidv4 } = require("uuid")

/**
 * Create a new ground
 * @param {string} turfId - The ID of the turf
 * @param {Object} groundData - The ground data
 * @returns {Promise<Object>} - The created ground
 */
const createGround = async (turfId, groundData) => {
  try {
    const ground = await TurfGround.create({
      ...groundData,
      turfId,
    })
    return ground
  } catch (error) {
    throw new Error(`Failed to create ground: ${error.message}`)
  }
}

/**
 * Get a ground by ID
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Object>} - The ground
 */
const getGround = async (groundId) => {
  try {
    const ground = await TurfGround.findByPk(groundId, {
      include: [
        {
          model: TurfSlot,
          as: "slots",
          include: [
            {
              model: Day,
              as: "day",
            },
          ],
        },
      ],
    })

    if (!ground) {
      throw new Error("Ground not found")
    }

    return ground
  } catch (error) {
    throw new Error(`Failed to get ground: ${error.message}`)
  }
}

/**
 * Get all grounds for a turf
 * @param {string} turfId - The ID of the turf
 * @returns {Promise<Array>} - The grounds
 */
const getGroundsByTurf = async (turfId) => {
  try {
    const grounds = await TurfGround.findAll({
      where: { turfId },
      include: [
        {
          model: TurfSlot,
          as: "slots",
          include: [
            {
              model: Day,
              as: "day",
            },
          ],
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    return grounds
  } catch (error) {
    throw new Error(`Failed to get grounds: ${error.message}`)
  }
}

/**
 * Update a ground
 * @param {string} groundId - The ID of the ground
 * @param {Object} groundData - The ground data
 * @returns {Promise<Object>} - The updated ground
 */
const updateGround = async (groundId, groundData) => {
  try {
    const ground = await TurfGround.findByPk(groundId)

    if (!ground) {
      throw new Error("Ground not found")
    }

    await ground.update(groundData)

    return ground
  } catch (error) {
    throw new Error(`Failed to update ground: ${error.message}`)
  }
}

/**
 * Delete a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<void>}
 */
const deleteGround = async (groundId) => {
  try {
    const ground = await TurfGround.findByPk(groundId)

    if (!ground) {
      throw new Error("Ground not found")
    }

    await ground.destroy()
  } catch (error) {
    throw new Error(`Failed to delete ground: ${error.message}`)
  }
}

/**
 * Add an image to a ground
 * @param {string} groundId - The ID of the ground
 * @param {string} imageUrl - The URL of the image
 * @param {boolean} isMainImage - Whether the image is the main image
 * @returns {Promise<Object>} - The updated ground
 */
const addGroundImage = async (groundId, imageUrl, isMainImage = false) => {
  try {
    const ground = await TurfGround.findByPk(groundId)

    if (!ground) {
      throw new Error("Ground not found")
    }

    const images = ground.images || []

    if (isMainImage) {
      // If this is the main image, update the mainImageUrl
      await ground.update({ mainImageUrl: imageUrl })
    }

    // Add to images array
    images.push(imageUrl)
    await ground.update({ images })

    return ground
  } catch (error) {
    throw new Error(`Failed to add image: ${error.message}`)
  }
}

/**
 * Get slots for a ground
 * @param {string} groundId - The ID of the ground
 * @param {string} startDate - The start date
 * @param {string} endDate - The end date
 * @returns {Promise<Array>} - The slots
 */
const getGroundSlots = async (groundId, startDate, endDate) => {
  try {
    const whereClause = { groundId }

    if (startDate && endDate) {
      // If both dates are provided, find slots between these dates
      const startDay = await Day.findOne({ where: { date: startDate } })
      const endDay = await Day.findOne({ where: { date: endDate } })

      if (startDay && endDay) {
        whereClause.dayId = {
          [Op.between]: [startDay.id, endDay.id],
        }
      }
    } else if (startDate) {
      // If only start date is provided, find slots from this date onwards
      const startDay = await Day.findOne({ where: { date: startDate } })

      if (startDay) {
        whereClause.dayId = {
          [Op.gte]: startDay.id,
        }
      }
    }

    const slots = await TurfSlot.findAll({
      where: whereClause,
      include: [
        {
          model: Day,
          as: "day",
        },
      ],
      order: [
        [{ model: Day, as: "day" }, "date", "ASC"],
        ["startTime", "ASC"],
      ],
    })

    return slots
  } catch (error) {
    throw new Error(`Failed to get slots: ${error.message}`)
  }
}

/**
 * Create a slot for a ground
 * @param {string} groundId - The ID of the ground
 * @param {Object} slotData - The slot data
 * @returns {Promise<Object>} - The created slot
 */
const createSlot = async (groundId, slotData) => {
  try {
    const { dayId, startTime, endTime, price, status } = slotData

    // Check if the ground exists
    const ground = await TurfGround.findByPk(groundId)
    if (!ground) {
      throw new Error("Ground not found")
    }

    // Check if the day exists
    const day = await Day.findByPk(dayId)
    if (!day) {
      throw new Error("Day not found")
    }

    // Create the slot
    const slot = await TurfSlot.create({
      groundId,
      dayId,
      startTime,
      endTime,
      price,
      status: status || "available",
    })

    return slot
  } catch (error) {
    throw new Error(`Failed to create slot: ${error.message}`)
  }
}

/**
 * Update a slot
 * @param {string} slotId - The ID of the slot
 * @param {Object} slotData - The slot data
 * @returns {Promise<Object>} - The updated slot
 */
const updateSlot = async (slotId, slotData) => {
  try {
    const slot = await TurfSlot.findByPk(slotId)

    if (!slot) {
      throw new Error("Slot not found")
    }

    await slot.update(slotData)

    return slot
  } catch (error) {
    throw new Error(`Failed to update slot: ${error.message}`)
  }
}

/**
 * Delete a slot
 * @param {string} slotId - The ID of the slot
 * @returns {Promise<void>}
 */
const deleteSlot = async (slotId) => {
  try {
    const slot = await TurfSlot.findByPk(slotId)

    if (!slot) {
      throw new Error("Slot not found")
    }

    await slot.destroy()
  } catch (error) {
    throw new Error(`Failed to delete slot: ${error.message}`)
  }
}

/**
 * Get reviews for a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Array>} - The reviews
 */
const getGroundReviews = async (groundId) => {
  try {
    const reviews = await TurfReview.findAll({
      where: { groundId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "profilePicture"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    return reviews
  } catch (error) {
    throw new Error(`Failed to get reviews: ${error.message}`)
  }
}

/**
 * Get dashboard data for a ground
 * @param {string} groundId - The ID of the ground
 * @returns {Promise<Object>} - The dashboard data
 */
const getGroundDashboard = async (groundId) => {
  try {
    // Get the ground
    const ground = await TurfGround.findByPk(groundId)

    if (!ground) {
      throw new Error("Ground not found")
    }

    // Get total slots
    const totalSlots = await TurfSlot.count({ where: { groundId } })

    // Get booked slots
    const bookedSlots = await TurfSlot.count({
      where: {
        groundId,
        status: "booked",
      },
    })

    // Get available slots
    const availableSlots = await TurfSlot.count({
      where: {
        groundId,
        status: "available",
      },
    })

    // Get total reviews
    const totalReviews = await TurfReview.count({ where: { groundId } })

    // Get average rating
    const reviews = await TurfReview.findAll({
      where: { groundId },
      attributes: ["rating"],
    })

    let averageRating = 0
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / reviews.length
    }

    // Get recent bookings
    const recentBookings = await TurfSlot.findAll({
      where: {
        groundId,
        status: "booked",
      },
      include: [
        {
          model: Day,
          as: "day",
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "profilePicture"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: 5,
    })

    return {
      ground,
      stats: {
        totalSlots,
        bookedSlots,
        availableSlots,
        totalReviews,
        averageRating,
      },
      recentBookings,
    }
  } catch (error) {
    throw new Error(`Failed to get dashboard data: ${error.message}`)
  }
}

/**
 * Generate slots for a ground for a specific date
 * @param {string} groundId - The ID of the ground
 * @param {string} date - The date
 * @returns {Promise<Array>} - The generated slots
 */
const generateSlotsForDate = async (groundId, date) => {
  try {
    // Get the ground
    const ground = await TurfGround.findByPk(groundId)

    if (!ground) {
      throw new Error("Ground not found")
    }

    // Get or create the day
    const [day] = await Day.findOrCreate({
      where: { date },
      defaults: { date },
    })

    // Check if slots already exist for this day and ground
    const existingSlots = await TurfSlot.count({
      where: {
        groundId,
        dayId: day.id,
      },
    })

    if (existingSlots > 0) {
      throw new Error("Slots already exist for this date")
    }

    // Get the operating hours from the ground or use defaults
    const openingTime = ground.openingTime || "06:00:00"
    const closingTime = ground.closingTime || "22:00:00"

    // Get the slot duration from the ground or use default
    const slotDuration = ground.slotDuration || 60 // in minutes

    // Generate slots
    const slots = []
    let currentTime = new Date(`2000-01-01T${openingTime}`)
    const endTime = new Date(`2000-01-01T${closingTime}`)

    while (currentTime < endTime) {
      const startTime = currentTime.toTimeString().split(" ")[0]

      // Add slot duration to current time
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000)

      // If we've gone past the closing time, break
      if (currentTime > endTime) {
        break
      }

      const slotEndTime = currentTime.toTimeString().split(" ")[0]

      // Create the slot
      const slot = await TurfSlot.create({
        groundId,
        dayId: day.id,
        startTime,
        endTime: slotEndTime,
        price: ground.pricePerHour || 0,
        status: "available",
      })

      slots.push(slot)
    }

    return slots
  } catch (error) {
    throw new Error(`Failed to generate slots: ${error.message}`)
  }
}

/**
 * Book a slot
 * @param {string} slotId - The ID of the slot
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The booked slot
 */
const bookSlot = async (slotId, userId) => {
  try {
    const slot = await TurfSlot.findByPk(slotId)

    if (!slot) {
      throw new Error("Slot not found")
    }

    if (slot.status !== "available") {
      throw new Error("Slot is not available")
    }

    await slot.update({
      status: "booked",
      userId,
      bookedAt: new Date(),
    })

    return slot
  } catch (error) {
    throw new Error(`Failed to book slot: ${error.message}`)
  }
}

/**
 * Cancel a booking
 * @param {string} slotId - The ID of the slot
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The cancelled slot
 */
const cancelBooking = async (slotId, userId) => {
  try {
    const slot = await TurfSlot.findByPk(slotId)

    if (!slot) {
      throw new Error("Slot not found")
    }

    if (slot.status !== "booked") {
      throw new Error("Slot is not booked")
    }

    if (slot.userId !== userId) {
      throw new Error("You are not authorized to cancel this booking")
    }

    await slot.update({
      status: "available",
      userId: null,
      bookedAt: null,
      paymentStatus: null,
    })

    return slot
  } catch (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`)
  }
}

/**
 * Update payment status for a slot
 * @param {string} slotId - The ID of the slot
 * @param {string} status - The payment status
 * @returns {Promise<Object>} - The updated slot
 */
const updatePaymentStatus = async (slotId, status) => {
  try {
    const slot = await TurfSlot.findByPk(slotId)

    if (!slot) {
      throw new Error("Slot not found")
    }

    if (slot.status !== "booked") {
      throw new Error("Slot is not booked")
    }

    await slot.update({
      paymentStatus: status,
    })

    return slot
  } catch (error) {
    throw new Error(`Failed to update payment status: ${error.message}`)
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
