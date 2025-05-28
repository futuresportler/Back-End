const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotion.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateCreatePromotion,
  validateProcessPayment,
  validateUpdatePromotionPlan,
  validateGetPromotions
} = require("../validation/promotionValidator");

// Get available promotion plans (public)
router.get("/plans", promotionController.getAvailablePromotionPlans);

// Create promotion transaction
router.post(
  "/",
  authMiddleware,
  validateCreatePromotion,
  promotionController.createPromotionTransaction
);

// Get supplier promotions
router.get(
  "/supplier",
  authMiddleware,
  validateGetPromotions,
  promotionController.getSupplierPromotions
);

// Get promotion details
router.get(
  "/:promotionTransactionId",
  authMiddleware,
  promotionController.getPromotionDetails
);

// Process payment for promotion
router.post(
  "/:promotionTransactionId/payment",
  authMiddleware,
  validateProcessPayment,
  promotionController.processPayment
);

// Update promotion plan for a service
router.patch(
  "/:serviceType/:serviceId",
  authMiddleware,
  validateUpdatePromotionPlan,
  promotionController.updatePromotionPlan
);

// Get promotion analytics
router.get(
  "/analytics/overview",
  authMiddleware,
  promotionController.getPromotionAnalytics
);

module.exports = router;