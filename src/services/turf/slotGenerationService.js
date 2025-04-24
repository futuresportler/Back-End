const { TurfGround, TurfSlot, Day, sequelize } = require("../../database")
const { v4: uuidv4 } = require("uuid")
const { info, error } = require("../../config/logging")

/**
 * Generate slots for a specific turf ground for a given date
 * @param {string} groundId - The ID of the turf ground
 * @param {Date} date - The date to generate slots for
 * @returns {Promise<Array>} - Array of created slots
 */
const generateSlotsForDate = async (groundId, date) => {
  try {
    // Get the turf ground details
    const ground = await TurfGround.findByPk(groundId, {
      include: ["turfProfile"],
    })

    if (!ground) {
      throw new Error(`Ground with ID ${groundId} not found`)
    }

    // Get the day of the week (0-6, where 0 is Sunday)
    const dayOfWeek = date.getDay()

    // Get the Day record from the database
    const dayRecord = await Day.findOne({
      where: { dayNumber: dayOfWeek },
    })

    if (!dayRecord) {
      throw new Error(`Day record for day number ${dayOfWeek} not found`)
    }

    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]

    // Check if slots already exist for this ground and date
    const existingSlots = await TurfSlot.count({
      where: {
        groundId,
        date: formattedDate,
      },
    })

    if (existingSlots > 0) {
      info(`Slots already exist for ground ${groundId} on ${formattedDate}`)
      return []
    }

    // Get the operating hours from the turf profile
    const openingTime = ground.turfProfile.openingTime || "06:00:00"
    const closingTime = ground.turfProfile.closingTime || "22:00:00"

    // Parse opening and closing times
    const [openHour, openMinute] = openingTime.split(":").map(Number)
    const [closeHour, closeMinute] = closingTime.split(":").map(Number)

    // Calculate the number of slots (assuming 1-hour slots)
    const slotDurationHours = 1
    const totalHours = closeHour + closeMinute / 60 - (openHour + openMinute / 60)
    const numberOfSlots = Math.floor(totalHours / slotDurationHours)

    // Generate slots
    const slots = []
    for (let i = 0; i < numberOfSlots; i++) {
      const startHour = openHour + i * slotDurationHours
      const endHour = startHour + slotDurationHours

      // Format times as HH:MM:00
      const startTime = `${String(Math.floor(startHour)).padStart(2, "0")}:${String(Math.floor((startHour % 1) * 60)).padStart(2, "0")}:00`
      const endTime = `${String(Math.floor(endHour)).padStart(2, "0")}:${String(Math.floor((endHour % 1) * 60)).padStart(2, "0")}:00`

      slots.push({
        slotId: uuidv4(),
        turfId: ground.turfId,
        groundId,
        dayId: dayRecord.id,
        date: formattedDate,
        startTime,
        endTime,
        price: ground.hourlyRate || 0,
        status: "available",
        bookingType: "hourly",
      })
    }

    // Bulk create the slots
    const createdSlots = await TurfSlot.bulkCreate(slots)
    info(`Generated ${createdSlots.length} slots for ground ${groundId} on ${formattedDate}`)

    return createdSlots
  } catch (err) {
    error(`Error generating slots for ground ${groundId}: ${err.message}`)
    throw err
  }
}

/**
 * Generate initial slots for a turf ground (15 days in advance)
 * @param {string} groundId - The ID of the turf ground
 * @returns {Promise<Array>} - Array of created slots
 */
const generateInitialSlots = async (groundId) => {
  try {
    const today = new Date()
    const slots = []

    // Generate slots for the next 15 days
    for (let i = 0; i < 15; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dailySlots = await generateSlotsForDate(groundId, date)
      slots.push(...dailySlots)
    }

    return slots
  } catch (err) {
    error(`Error generating initial slots for ground ${groundId}: ${err.message}`)
    throw err
  }
}

/**
 * Generate slots for all turf grounds for tomorrow
 * @returns {Promise<Array>} - Array of created slots
 */
const generateTomorrowSlots = async () => {
  try {
    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all active turf grounds
    const grounds = await TurfGround.findAll({
      where: { status: "active" },
    })

    const slots = []

    // Generate slots for each ground
    for (const ground of grounds) {
      const dailySlots = await generateSlotsForDate(ground.groundId, tomorrow)
      slots.push(...dailySlots)
    }

    return slots
  } catch (err) {
    error(`Error generating tomorrow's slots: ${err.message}`)
    throw err
  }
}

module.exports = {
  generateSlotsForDate,
  generateInitialSlots,
  generateTomorrowSlots,
}
