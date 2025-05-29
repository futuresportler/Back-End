const { body, param ,query } = require("express-validator");
const Joi = require("joi");

// Validation rules using express-validator
const validateCreateUser = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("first_name")
    .isString()
    .withMessage("First name must be a string")
    .isLength({ min: 1 })
    .withMessage("First name is required"),
  body("last_name")
    .isString()
    .withMessage("Last name must be a string")
    .isLength({ min: 1 })
    .withMessage("Last name is required"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
];

const validateUpdateUser = [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("isVerified").optional().isBoolean().withMessage("Must be a boolean"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "banned"])
    .withMessage("Invalid status"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
];

const validateRequest = (req, res, next) => {
  const errors = require("express-validator").validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((item) => item.msg);
    return res.status(400).json({ error: errorMessages });
  }
  next();
};

const validateOTPVerification = [
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

const validateAddFavorite = [
  body("entityType")
    .isIn(["academy", "coach", "turf"])
    .withMessage("Entity type must be 'academy', 'coach', or 'turf'"),
  body("entityId")
    .isUUID()
    .withMessage("Entity ID must be a valid UUID"),
];

const validateRemoveFavorite = [
  param("entityType")
    .isIn(["academy", "coach", "turf"])
    .withMessage("Entity type must be 'academy', 'coach', or 'turf'"),
  param("entityId")
    .isUUID()
    .withMessage("Entity ID must be a valid UUID"),
];

const validateCheckFavorite = [
  param("entityType")
    .isIn(["academy", "coach", "turf"])
    .withMessage("Entity type must be 'academy', 'coach', or 'turf'"),
  param("entityId")
    .isUUID()
    .withMessage("Entity ID must be a valid UUID"),
];

const validateGetFavorites = [
  query("entityType")
    .optional()
    .isIn(["academy", "coach", "turf"])
    .withMessage("Entity type must be 'academy', 'coach', or 'turf'"),
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateRequest,
  validateOTPVerification,

  validateAddFavorite,
  validateRemoveFavorite,
  validateCheckFavorite,
  validateGetFavorites,
};
