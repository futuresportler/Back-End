const { body, param } = require("express-validator");
const Joi = require("joi");

const validateCreateCoach = [
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
  body("mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("specialization").isString().withMessage("Specialization must be a string"),
  body("experience_years").optional().isInt().withMessage("Experience years must be an integer"),
  body("biography").optional().isString().withMessage("Biography must be a string"),
  body("hourly_rate").optional().isFloat().withMessage("Hourly rate must be a float"),
  body("availability").optional().isJSON().withMessage("Availability must be a JSON object"),
  body("location").isString().withMessage("Location must be a string"),
  body("certification_ids").optional().isArray().withMessage("Certification IDs must be an array of integers"),
];

const validateUpdateCoach = [
  param("id").isUUID().withMessage("Invalid coach ID format"),
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
  body("isVerified").optional().isBoolean().withMessage("Must be a boolean"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "banned"])
    .withMessage("Invalid status"),
  body("specialization").optional().isString().withMessage("Specialization must be a string"),
  body("experience_years").optional().isInt().withMessage("Experience years must be an integer"),
  body("biography").optional().isString().withMessage("Biography must be a string"),
  body("hourly_rate").optional().isFloat().withMessage("Hourly rate must be a float"),
  body("availability").optional().isJSON().withMessage("Availability must be a JSON object"),
  body("location").optional().isString().withMessage("Location must be a string"),
  body("certification_ids").optional().isArray().withMessage("Certification IDs must be an array of integers"),
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
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];


module.exports = {
  validateCreateCoach,
  validateUpdateCoach,
  validateRequest,
  validateOTPVerification,
};
