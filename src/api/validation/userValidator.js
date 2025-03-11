const { body, param } = require("express-validator");
const Joi = require("joi");

// Validation rules using express-validator
const validateCreateUser = [
  body("mobile")
    .isString()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Invalid mobile number"),
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
];

const validateUpdateUser = [
  param("id").isUUID().withMessage("Invalid user ID format"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("is_verified").optional().isBoolean().withMessage("Must be a boolean"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "banned"])
    .withMessage("Invalid status"),
];

const validateUserId = [
  param("id").isUUID().withMessage("Invalid user ID format"),
];

const validateRequest = (req, res, next) => {
  const errors = require("express-validator").validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};


const validateOTPRequest = [
  body("email").isEmail().withMessage("Invalid email format"),
];

const validateOTPVerification = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];


module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateRequest,
  validateOTPRequest,
  validateOTPVerification,
};
