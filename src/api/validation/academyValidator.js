const { body, param } = require("express-validator");
const Joi = require("joi");

const validateCreateAcademy = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a string"),
  body("mobile").optional().isString().withMessage("Mobile must be a string"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
  body("sport_type")
    .optional()
    .isString()
    .withMessage("Sport type must be a string"),
  body("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("facilities")
    .optional()
    .isJSON()
    .withMessage("Facilities must be a JSON object"),
  body("sports_offered")
    .optional()
    .isArray()
    .withMessage("Sports offered must be an array of strings"),
  body("founding_year")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(
      `Founding year must be an integer between 1800 and ${new Date().getFullYear()}`
    ),
  body("contact_email")
    .optional()
    .isEmail()
    .withMessage("Invalid contact email format"),
  body("contact_phone")
    .optional()
    .matches(/^[0-9]+$/)
    .withMessage("Contact phone must contain only numbers"),
];

const validateUpdateAcademy = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .isString()
    .withMessage("Password must be a string"),
  body("mobile").optional().isString().withMessage("Mobile must be a string"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
  body("sport_type")
    .optional()
    .isString()
    .withMessage("Sport type must be a string"),
  body("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("facilities")
    .optional()
    .isJSON()
    .withMessage("Facilities must be a JSON object"),
  body("sports_offered")
    .optional()
    .isArray()
    .withMessage("Sports offered must be an array of strings"),
  body("founding_year")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(
      `Founding year must be an integer between 1800 and ${new Date().getFullYear()}`
    ),
  body("contact_email")
    .optional()
    .isEmail()
    .withMessage("Invalid contact email format"),
  body("contact_phone")
    .optional()
    .matches(/^[0-9]+$/)
    .withMessage("Contact phone must contain only numbers"),
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

module.exports = {
  validateCreateAcademy,
  validateUpdateAcademy,
  validateRequest,
  validateOTPVerification,
};
