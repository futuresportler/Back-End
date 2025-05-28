const { v4: uuidv4 } = require("uuid");
const promotionRepository = require("./repositories/promotionRepository");
const servicePriorityRepository = require("./repositories/servicePriorityRepository");
const { sequelize } = require("../../database");

// Promotion plan configurations
const PROMOTION_PLANS = {
  basic: { priorityValue: 100, duration: 30, price: 999 },
  premium: { priorityValue: 200, duration: 30, price: 1999 },
  platinum: { priorityValue: 300, duration: 30, price: 2999 }
};

const createPromotionTransaction = async (promotionData) => {
  const { supplierId, serviceType, serviceId, promotionPlan } = promotionData;
  
  if (!PROMOTION_PLANS[promotionPlan]) {
    throw new Error("Invalid promotion plan");
  }

  const plan = PROMOTION_PLANS[promotionPlan];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + plan.duration);

  const transaction = await promotionRepository.createPromotionTransaction({
    promotionTransactionId: uuidv4(),
    supplierId,
    serviceType,
    serviceId,
    promotionPlan,
    priorityValue: plan.priorityValue,
    amount: plan.price,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    status: "pending"
  });

  return transaction;
};

const processPromotionPayment = async (promotionTransactionId, paymentData) => {
  return await sequelize.transaction(async (t) => {
    // Record payment
    const updatedPromotion = await promotionRepository.recordPromotionPayment(
      promotionTransactionId, 
      paymentData
    );

    // Update service priority
    await servicePriorityRepository.updateServicePriority(
      updatedPromotion.serviceType,
      updatedPromotion.serviceId,
      {
        value: updatedPromotion.priorityValue,
        plan: updatedPromotion.promotionPlan,
        expiresAt: updatedPromotion.endDate
      }
    );

    return updatedPromotion;
  });
};

const getSupplierPromotions = async (supplierId, filters = {}) => {
  return await promotionRepository.findPromotionsBySupplier(supplierId, filters);
};

const getPromotionById = async (promotionTransactionId) => {
  const promotion = await promotionRepository.findPromotionById(promotionTransactionId);
  if (!promotion) {
    throw new Error("Promotion transaction not found");
  }
  return promotion;
};

const updatePromotionPlan = async (supplierId, serviceType, serviceId, newPlan) => {
  if (!PROMOTION_PLANS[newPlan]) {
    throw new Error("Invalid promotion plan");
  }

  return await sequelize.transaction(async (t) => {
    // Create new promotion transaction
    const newPromotion = await createPromotionTransaction({
      supplierId,
      serviceType,
      serviceId,
      promotionPlan: newPlan
    });

    return newPromotion;
  });
};

const getPromotionAnalytics = async (supplierId, period = 6) => {
  return await promotionRepository.getPromotionAnalytics(supplierId, period);
};

const getAvailablePromotionPlans = () => {
  return Object.entries(PROMOTION_PLANS).map(([name, config]) => ({
    name,
    priorityValue: config.priorityValue,
    duration: config.duration,
    price: config.price
  }));
};

module.exports = {
  createPromotionTransaction,
  processPromotionPayment,
  getSupplierPromotions,
  getPromotionById,
  updatePromotionPlan,
  getPromotionAnalytics,
  getAvailablePromotionPlans,
  PROMOTION_PLANS
};