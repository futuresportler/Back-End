const promotionService = require("../../services/promotion");
const { successResponse, errorResponse } = require("../../common/utils/response");

const createPromotionTransaction = async (req, res) => {
  try {
    const { serviceType, serviceId, promotionPlan } = req.body;
    const supplierId = req.user.supplierId;

    const promotion = await promotionService.createPromotionTransaction({
      supplierId,
      serviceType,
      serviceId,
      promotionPlan
    });

    successResponse(res, "Promotion transaction created successfully", promotion, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const processPayment = async (req, res) => {
  try {
    const { promotionTransactionId } = req.params;
    const paymentData = req.body;

    const updatedPromotion = await promotionService.processPromotionPayment(
      promotionTransactionId,
      paymentData
    );

    successResponse(res, "Payment processed and service priority updated", updatedPromotion);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSupplierPromotions = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const filters = req.query;

    const promotions = await promotionService.getSupplierPromotions(supplierId, filters);
    successResponse(res, "Promotions fetched successfully", promotions);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getPromotionDetails = async (req, res) => {
  try {
    const { promotionTransactionId } = req.params;
    
    const promotion = await promotionService.getPromotionById(promotionTransactionId);
    successResponse(res, "Promotion details fetched", promotion);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updatePromotionPlan = async (req, res) => {
  try {
    const { serviceType, serviceId } = req.params;
    const { promotionPlan } = req.body;
    const supplierId = req.user.supplierId;

    const newPromotion = await promotionService.updatePromotionPlan(
      supplierId,
      serviceType,
      serviceId,
      promotionPlan
    );

    successResponse(res, "Promotion plan updated successfully", newPromotion);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getPromotionAnalytics = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const { period = 6 } = req.query;

    const analytics = await promotionService.getPromotionAnalytics(supplierId, parseInt(period));
    successResponse(res, "Promotion analytics fetched", analytics);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getAvailablePromotionPlans = async (req, res) => {
  try {
    const plans = promotionService.getAvailablePromotionPlans();
    successResponse(res, "Available promotion plans", plans);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  createPromotionTransaction,
  processPayment,
  getSupplierPromotions,
  getPromotionDetails,
  updatePromotionPlan,
  getPromotionAnalytics,
  getAvailablePromotionPlans
};