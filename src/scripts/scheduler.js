const cron = require("node-cron");
const { info, error } = require("../config/logging");
const generateMonthlyFees = require("./generateMonthlyFees");
const {
  generateTomorrowSlots,
} = require("../services/turf/slotGenerationService");
const {
  generateSessions,
} = require("../services/session/sessionGenerationService");
const config = require("../common/utils/config");
const updateMonthlyMetrics = require("./updateMonthlyMetrics");


/**
 * Initialize all scheduled tasks
 */
function initScheduledTasks() {
  // Schedule monthly fee generation (runs based on configuration)
  cron.schedule(config.scheduler.feeGeneration, async () => {
    try {
      if (isLastWeekOfMonth()) {
        info("Starting scheduled monthly fee generation");
        const result = await generateMonthlyFees();
        info(
          `Fee generation completed: ${result.success ? "Success" : "Failed"}`
        );
        if (result.totalFeesGenerated) {
          info(`Total fees generated: ${result.totalFeesGenerated}`);
        }
      } else {
        info("Not in the last week of the month. Skipping fee generation.");
      }
    } catch (err) {
      error(`Error in scheduled fee generation: ${err.message}`);
      error(err.stack);
    }
  });
  cron.schedule("59 23 28-31 * *", async () => {
    const now = new Date();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // Only run if it's the last day of the month
    if (now.getDate() === lastDayOfMonth) {
      console.log("Running monthly metrics update job");
      await updateMonthlyMetrics();
    }
  });
  // Schedule daily slot generation for all turf grounds (runs based on configuration)
  cron.schedule(config.scheduler.slotGeneration, async () => {
    try {
      info("Starting scheduled turf slot generation for tomorrow");
      const slots = await generateTomorrowSlots();
      info(`Slot generation completed: Generated ${slots.length} slots`);
    } catch (err) {
      error(`Error in scheduled slot generation: ${err.message}`);
      error(err.stack);
    }
  });

  // Schedule session generation (runs based on configuration)
  cron.schedule(config.scheduler.sessionGeneration, async () => {
    try {
      info("Starting scheduled session generation");
      const result = await generateSessions();
      info(
        `Session generation completed: Generated ${result.currentMonth.total} sessions for current month`
      );
      if (result.nextMonth > 0) {
        info(`Also generated ${result.nextMonth} sessions for next month`);
      }
    } catch (err) {
      error(`Error in scheduled session generation: ${err.message}`);
      error(err.stack);
    }
  });

  info("Scheduled tasks initialized");
}

/**
 * Check if the current date is in the last week of the month
 */
function isLastWeekOfMonth() {
  const today = new Date();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const currentDay = today.getDate();

  // Consider the last 7 days of the month as the last week
  return currentDay > lastDayOfMonth - 7;
}

module.exports = {
  initScheduledTasks,
};
