const { supplierService } = require("../../services/supplier");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");

const signup = async (req, res) => {
  try {
    const { supplier, tokens } = await supplierService.signUp(req.body);
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
    const tokens = await supplierService.signIn(
      req.body.email,
      req.body.password
    );
    successResponse(res, "Login successful", { tokens });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const tokens = await supplierService.refreshToken(req.user.supplierId);
    successResponse(res, "Token refreshed", { tokens });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSupplierProfile = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierProfile(
      req.user.supplierId
    );
    successResponse(res, "Supplier profile fetched", supplier);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateSupplierProfile = async (req, res) => {
  try {
    const updated = await supplierService.updateSupplierProfile(
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
    await supplierService.deleteSupplier(req.user.supplierId);
    successResponse(res, "Supplier deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const setSupplierModule = async (req, res) => {
  try {
    const supplier = await supplierService.updateSupplierModule(
      req.user.supplierId,
      req.body.module
    );
    successResponse(res, "Module updated", supplier);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSupplierModule = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierProfile(
      req.user.supplierId
    );
    successResponse(res, "Module fetched", { module: supplier.module });
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
  getSupplierModule,
};
