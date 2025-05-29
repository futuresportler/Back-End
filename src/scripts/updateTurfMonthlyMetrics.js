const { TurfMonthlyMetric, Month, TurfProfile } = require("../database");
const turfMetricsRepository = require("../services/turf/repositories/turfMetricsRepository");
const { info, error } = require("../config/logging");

/**
 * Updates monthly metrics for all turfs
 * This script is designed to be run as a scheduled task at the end of each month
 */
async function updateTurfMonthlyMetrics() {
  info("Starting turf monthly metrics update process");

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

    // Get all turf profiles
    const turfs = await TurfProfile.findAll({
      where: { status: "active" }
    });
    
    info(`Found ${turfs.length} active turfs`);

    // Process each turf
    for (const turf of turfs) {
      info(`Processing metrics for turf: ${turf.name} (${turf.turfId})`);
      
      try {
        await updateTurfMetrics(turf.turfId, currentMonth.monthId);
      } catch (err) {
        error(`Error updating metrics for turf ${turf.name}: ${err.message}`);
      }
    }

    info("Monthly turf metrics update completed");
    return { success: true };
  } catch (err) {
    error(`Error in turf metrics update process: ${err.message}`);
    error(err.stack);
    return { success: false, error: err.message };
  }
}

/**
 * Update metrics for a single turf
 */
async function updateTurfMetrics(turfId, monthId) {
  try {
    const metrics = await turfMetricsRepository.updateAllMetrics(turfId, monthId);
    
    info(`Updated metrics for turf ${turfId} for month ${monthId}`);
    info(`Metrics summary: ${metrics.bookedSlots} bookings, ${metrics.revenue} revenue, ${metrics.utilization}% utilization`);
    
    return metrics;
  } catch (err) {
    error(`Error updating turf metrics: ${err.message}`);
    throw err;
  }
}

// If this script is run directly
if (require.main === module) {
  updateTurfMonthlyMetrics()
    .then(result => {
      console.log("Turf metrics update completed:", result);
      process.exit(0);
    })
    .catch(err => {
      console.error("Error:", err);
      process.exit(1);
    });
}

module.exports = updateTurfMonthlyMetrics;