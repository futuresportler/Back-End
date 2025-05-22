const { sequelize, AcademyMetric, Month, AcademyProfile } = require("../database");
const academyMetricsRepository = require("../services/academy/repositories/academyMetricsRepository");
const academyFeeRepository = require("../services/academy/repositories/academyFeeRepository");
const { Op } = require("sequelize");
const { info, error } = require("../config/logging");

/**
 * Updates monthly metrics for all academies
 * This script is designed to be run as a scheduled task at the end of each month
 */
async function updateMonthlyMetrics() {
  info("Starting monthly metrics update process");

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

    // Get all academy profiles
    const academies = await AcademyProfile.findAll({
      where: { status: "active" }
    });
    
    info(`Found ${academies.length} active academies`);

    // Process each academy
    for (const academy of academies) {
      info(`Processing metrics for academy: ${academy.name} (${academy.academyId})`);
      
      try {
        await updateAcademyMetrics(academy.academyId, currentMonth.monthId);
      } catch (err) {
        error(`Error updating metrics for academy ${academy.name}: ${err.message}`);
      }
    }

    info("Monthly metrics update completed");
    return { success: true };
  } catch (err) {
    error(`Error in metrics update process: ${err.message}`);
    error(err.stack);
    return { success: false, error: err.message };
  }
}

/**
 * Update metrics for a single academy
 */
async function updateAcademyMetrics(academyId, monthId) {
  // Get month data for date calculations
  const month = await Month.findByPk(monthId);
  if (!month) throw new Error("Month not found");
  
  const year = month.year;
  const monthNum = month.monthNumber - 1; // JS months are 0-indexed
  const startDate = new Date(year, monthNum, 1);
  const endDate = new Date(year, monthNum + 1, 0); // Last day of month
  
  // Get or create monthly metric record
  const metric = await academyMetricsRepository.getOrCreateMonthlyMetric(academyId, monthId);
  
  // Calculate profile views
  const profileViews = await academyMetricsRepository.countProfileViews(academyId, {
    startDate,
    endDate
  });
  
  // Calculate inquiries and conversion rate
  const conversionData = await academyMetricsRepository.calculateConversionRate(academyId, monthId);
  
  // Get revenue data
  const feeData = await academyFeeRepository.getFeesByAcademyId(academyId, {
    paymentDate: {
      [Op.between]: [startDate, endDate]
    }
  });
  
  const revenue = feeData.reduce((total, fee) => total + Number(fee.paidAmount || 0), 0);
  
  // Get pending fees
  const pendingFees = await academyFeeRepository.getFeesByAcademyId(academyId, {
    status: ["pending", "partial", "overdue"],
    dueDate: {
      [Op.lte]: endDate
    }
  });
  
  const pendingAmount = pendingFees.reduce((total, fee) => {
    return total + (Number(fee.totalAmount || 0) - Number(fee.paidAmount || 0));
  }, 0);
  
  // Update the metric record
  await metric.update({
    profileViews,
    inquiries: conversionData.inquiries,
    newEnrollments: conversionData.conversions,
    conversionRate: conversionData.rate,
    revenue,
    pendingFees: pendingAmount
    // Other metrics would be updated separately or from other data sources
  });
  
  info(`Updated metrics for academy ${academyId} for month ${month.monthName} ${month.year}`);
  return metric;
}

// If this script is run directly
if (require.main === module) {
  updateMonthlyMetrics()
    .then(result => {
      console.log("Metrics update completed:", result);
      process.exit(0);
    })
    .catch(err => {
      console.error("Error:", err);
      process.exit(1);
    });
}

module.exports = updateMonthlyMetrics;