const generateMonthlyFees = require("../../scripts/generateMonthlyFees");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const AdminPortalService = require("../../services/admin/adminPortal.service");

/**
 * Manually trigger fee generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const triggerFeeGeneration = async (req, res) => {
  try {
    const result = await generateMonthlyFees();

    if (result.success) {
      return successResponse(res, {
        message: "Fee generation completed successfully",
        totalFeesGenerated: result.totalFeesGenerated,
      });
    } else {
      return errorResponse(res, result.error, 500);
    }
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const requestOTP = async (req, res) => {
  try {
    await AdminPortalService.requestAdminOTP(req.body.email);
    successResponse(res, "OTP sent successfully");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const tokens = await AdminPortalService.verifyAdminOTP(
      req.body.email,
      req.body.otp
    );
    successResponse(res, "Login successful", { tokens });
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const getServices = async (req, res) => {
  try {
    const result = await AdminPortalService.getServices(
      req.query.type,
      req.query.page,
      req.query.limit,
      req.query.search
    );
    successResponse(res, "Services retrieved", result);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const deleteService = async (req, res) => {
  try {
    await AdminPortalService.deleteService(
      req.params.serviceId,
      req.query.serviceType,
      req.body.reason,
      req.user.email
    );
    successResponse(res, "Service deleted successfully");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 100, serviceType } = req.query;
    const offset = (page - 1) * limit;

    const logs = await AdminPortalService.getAuditLogs(
      serviceType,
      page,
      limit
    );
    if (!logs) {
      return errorResponse(res, "No logs found", 404);
    }

    successResponse(res, "Audit logs retrieved", logs);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = {
  triggerFeeGeneration,
  requestOTP,
  verifyOTP,
  getServices,
  deleteService,
  getAuditLogs,
};
