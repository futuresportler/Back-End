const generateMonthlyFees = require("../../scripts/generateMonthlyFees")
const { success, error } = require("../../common/utils/response")

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

module.exports = {
  triggerFeeGeneration,
}
