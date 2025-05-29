// src/scripts/updateCoachMonthlyMetrics.js
const { CoachProfile, Month } = require("../database");
const coachAnalyticsRepository = require("../services/coach/repositories/coachAnalyticsRepository");
const { info, error } = require("../config/logging");

/**
 * Updates monthly metrics for all coaches
 * This script is designed to be run as a scheduled task at the end of each month
 */
async function updateCoachMonthlyMetrics() {
  info("Starting coach monthly metrics update process");

  try {
    // Get current month
    const now = new Date();
    const currentMonth = await Month.findOne({
      where: {
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear()
      }
    });

    if (!currentMonth) {
      error("Current month not found in database");
      return { success: false, error: "Current month not found" };
    }

    // Get all coach profiles
    const coaches = await CoachProfile.findAll({
      where: { status: "active" }
    });
    
    info(`Found ${coaches.length} active coaches`);

    // Process each coach
    for (const coach of coaches) {
      info(`Processing metrics for coach: ${coach.name} (${coach.coachId})`);
      
      try {
        await coachAnalyticsRepository.updateAllCoachMetrics(coach.coachId, currentMonth.monthId);
      } catch (err) {
        error(`Error updating metrics for coach ${coach.name}: ${err.message}`);
      }
    }

    info("Monthly coach metrics update completed");
    return { success: true };
  } catch (err) {
    error(`Error in coach metrics update process: ${err.message}`);
    error(err.stack);
    return { success: false, error: err.message };
  }
}

// If this script is run directly
if (require.main === module) {
  updateCoachMonthlyMetrics()
    .then(result => {
      console.log("Coach metrics update completed:", result);
      process.exit(0);
    })
    .catch(err => {
      console.error("Error:", err);
      process.exit(1);
    });
}

module.exports = updateCoachMonthlyMetrics;