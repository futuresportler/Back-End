const { body, param, query } = require("express-validator");

const validateCreatePromotion = [
  body("serviceType")
    .isIn(["coach", "academy", "turf"])
    .withMessage("Service type must be coach, academy, or turf"),
  body("serviceId")
    .isUUID()
    .withMessage("Service ID must be a valid UUID"),
  body("promotionPlan")
    .isIn(["basic", "premium", "platinum"])
    .withMessage("Promotion plan must be basic, premium, or platinum")
];

const validateProcessPayment = [
  param("promotionTransactionId")
    .isUUID()
    .withMessage("Promotion transaction ID must be a valid UUID"),
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required"),
  body("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
];

const validateUpdatePromotionPlan = [
  param("serviceType")
    .isIn(["coach", "academy", "turf"])
    .withMessage("Service type must be coach, academy, or turf"),
  param("serviceId")
    .isUUID()
    .withMessage("Service ID must be a valid UUID"),
  body("promotionPlan")
    .isIn(["basic", "premium", "platinum"])
    .withMessage("Promotion plan must be basic, premium, or platinum")
];

const validateGetPromotions = [
  query("serviceType")
    .optional()
    .isIn(["coach", "academy", "turf"])
    .withMessage("Service type must be coach, academy, or turf"),
  query("status")
    .optional()
    .isIn(["pending", "paid", "expired", "cancelled"])
    .withMessage("Status must be pending, paid, expired, or cancelled"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
];

module.exports = {
  validateCreatePromotion,
  validateProcessPayment,
  validateUpdatePromotionPlan,
  validateGetPromotions
};