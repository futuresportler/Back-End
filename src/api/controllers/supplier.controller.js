const { SupplierService } = require("../../services/supplier")
const { successResponse, errorResponse } = require("../../common/utils/response")

const signup = async (req, res) => {
  try {
    const { supplier, tokens } = await SupplierService.signUp(req.body)
    successResponse(res, "Supplier created successfully", { supplier, tokens }, 201)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const signin = async (req, res) => {
  try {
    const tokens = await SupplierService.signIn(req.body)
    successResponse(res, "Login successful", { tokens })
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const refreshToken = async (req, res) => {
  try {
    const tokens = await SupplierService.refreshToken(req.user.supplierId)
    successResponse(res, "Token refreshed", { tokens })
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const updateSupplierProfile = async (req, res) => {
  try {
    const updated = await SupplierService.updateSupplierProfile(req.user.supplierId, req.body)
    successResponse(res, "Profile updated", updated)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const deleteSupplier = async (req, res) => {
  try {
    await SupplierService.deleteSupplier(req.user.supplierId)
    successResponse(res, "Supplier deleted successfully", null, 204)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const setSupplierModule = async (req, res) => {
  try {
    const supplier = await SupplierService.updateSupplierModule(
      req.user.supplierId,
      req.body.module,
      req.body.profileData,
    )
    successResponse(res, "Module created and profile linked", supplier)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getSupplierProfile = async (req, res) => {
  try {
    console.log("Module query", req.query)
    const supplier = await SupplierService.getSupplierProfile(req.user.supplierId, req.query.module, req.body.options)
    successResponse(res, "Module fetched", supplier)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getSupplierEntities = async (req, res) => {
  try {
    const entities = await SupplierService.getSupplierEntities(req.user.supplierId)
    successResponse(res, "Supplier entities fetched successfully", entities)
  } catch (error) {
    errorResponse(res, error.message, error)
  }
}

const getAnalyticsOverview = async (req, res) => {
  try {
    const period = req.query.period ? parseInt(req.query.period) : 6;
    
    if (isNaN(period) || period < 1 || period > 12) {
      return errorResponse(res, "Period must be a number between 1 and 12", null, 400);
    }
    
    const analytics = await SupplierService.getSupplierAnalyticsOverview(
      req.user.supplierId,
      period
    );
    
    successResponse(res, "Analytics overview fetched successfully", analytics);
  } catch (error) {
    console.error("Error fetching supplier analytics overview:", error);
    errorResponse(res, error.message, error);
  }
};
module.exports = {
  signup,
  signin,
  refreshToken,
  getSupplierProfile,
  updateSupplierProfile,
  deleteSupplier,
  setSupplierModule,
  getSupplierEntities,
  getAnalyticsOverview
}
