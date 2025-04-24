const cron = require("node-cron")
const { info, error } = require("../config/logging")
const generateMonthlyFees = require("./generateMonthlyFees")
const { generateTomorrowSlots } = require("../services/turf/slotGenerationService")

/**
 * Initialize all scheduled tasks
 */
function initScheduledTasks() {
  // Schedule monthly fee generation for the last week of each month (every day at 1:00 AM)
  // This will run only if the current date is in the last week of the month
  cron.schedule("0 1 * * *", async () => {
    try {
      if (isLastWeekOfMonth()) {
        info("Starting scheduled monthly fee generation")
        const result = await generateMonthlyFees()
        info(`Fee generation completed: ${result.success ? "Success" : "Failed"}`)
        if (result.totalFeesGenerated) {
          info(`Total fees generated: ${result.totalFeesGenerated}`)
        }
      } else {
        info("Not in the last week of the month. Skipping fee generation.")
      }
    } catch (err) {
      error(`Error in scheduled fee generation: ${err.message}`)
      error(err.stack)
    }
  })

  // Schedule daily slot generation for all turf grounds (runs at 12:00 AM every day)
  cron.schedule("0 0 * * *", async () => {
    try {
      info("Starting scheduled turf slot generation for tomorrow")
      const slots = await generateTomorrowSlots()
      info(`Slot generation completed: Generated ${slots.length} slots`)
    } catch (err) {
      error(`Error in scheduled slot generation: ${err.message}`)
      error(err.stack)
    }
  })

  info("Scheduled tasks initialized")
}

/**
 * Check if the current date is in the last week of the month
 */
function isLastWeekOfMonth() {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const currentDay = today.getDate()

  // Consider the last 7 days of the month as the last week
  return currentDay > lastDayOfMonth - 7
}

module.exports = {
  initScheduledTasks,
}
