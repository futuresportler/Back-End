const { SupplierService } = require("../../services/supplier");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const signup = async (req, res) => {
  try {
    const { supplier, tokens } = await SupplierService.signUp(req.body);
    successResponse(
      res,
      "Supplier created successfully",
      { supplier, tokens },
      201
    );
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const signin = async (req, res) => {
  try {
    const tokens = await SupplierService.signIn(req.body);
    successResponse(res, "Login successful", { tokens });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await SupplierService.refreshToken(req.user.supplierId);
    successResponse(res, "Token refreshed", { tokens });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateSupplierProfile = async (req, res) => {
  try {
    const updated = await SupplierService.updateSupplierProfile(
      req.user.supplierId,
      req.body
    );
    successResponse(res, "Profile updated", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    await SupplierService.deleteSupplier(req.user.supplierId);
    successResponse(res, "Supplier deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const setSupplierModule = async (req, res) => {
  try {
    const supplier = await SupplierService.updateSupplierModule(
      req.user.supplierId,
      req.body.module,
      req.body.profileData
    );
    successResponse(res, "Module created and profile linked", supplier);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSupplierProfile = async (req, res) => {
  try {
    console.log("Module query", req.query);
    const supplier = await SupplierService.getSupplierProfile(
      req.user.supplierId,
      req.query.module,
      req.body.options
    );
    successResponse(res, "Module fetched", supplier);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// Additional controller methods...

module.exports = {
  signup,
  signin,
  refreshToken,
  getSupplierProfile,
  updateSupplierProfile,
  deleteSupplier,
  setSupplierModule,
};
