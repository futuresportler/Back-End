const generateMonthlyFees = require("../../scripts/generateMonthlyFees")
const { success, error } = require("../../common/utils/response")
const updateMonthlyMetrics = require("../../scripts/updateMonthlyMetrics");

/**
 * Manually trigger fee generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const triggerFeeGeneration = async (req, res) => {
  try {
    const result = await generateMonthlyFees()

    if (result.success) {
      return success(res, {
        message: "Fee generation completed successfully",
        totalFeesGenerated: result.totalFeesGenerated,
      })
    } else {
      return error(res, result.error, 500)
    }
  } catch (err) {
    return error(res, err.message, 500)
  }
}
const triggerMetricsUpdate = async (req, res) => {
  try {
    const result = await updateMonthlyMetrics(req.body.academyId, req.body.monthId);
    successResponse(res, "Metrics update triggered successfully", {
      processed: result.processed || 1,
      status: "completed"
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  triggerFeeGeneration,
  triggerMetricsUpdate
}
