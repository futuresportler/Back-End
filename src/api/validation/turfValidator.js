const { body, param } = require("express-validator");

const validateCreateTurf = [
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
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("location")
    .isString()
    .withMessage("Location must be a string")
    .notEmpty()
    .withMessage("Location is required"),
  body("address")
    .isString()
    .withMessage("Address must be a string")
    .notEmpty()
    .withMessage("Address is required"),
  body("sports_supported")
    .isArray()
    .withMessage("Sports supported must be an array")
    .notEmpty()
    .withMessage("Sports supported is required"),
  body("hourly_rate")
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number")
    .notEmpty()
    .withMessage("Hourly rate is required"),
  body("facilities")
    .optional()
    .isArray()
    .withMessage("Facilities must be an array"),
  body("availability")
    .optional()
    .isJSON()
    .withMessage("Availability must be a JSON object"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("establishment_year")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(
      `Establishment year must be an integer between 1800 and ${new Date().getFullYear()}`
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

const validateUpdateTurf = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("mobile").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("location")
    .optional()
    .isString()
    .withMessage("Location must be a string"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("sports_supported")
    .optional()
    .isArray()
    .withMessage("Sports supported must be an array"),
  body("hourly_rate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),
  body("facilities")
    .optional()
    .isArray()
    .withMessage("Facilities must be an array"),
  body("availability")
    .optional()
    .isJSON()
    .withMessage("Availability must be a JSON object"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("establishment_year")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(
      `Establishment year must be an integer between 1800 and ${new Date().getFullYear()}`
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

const validateCommentCreate = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .isString()
    .withMessage("Comment must be a string")
    .notEmpty()
    .withMessage("Comment is required"),
];

const validateCommentUpdate = [
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .notEmpty()
    .withMessage("Comment cannot be empty"),
];

const validateOTPVerification = [
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

const validateRequest = (req, res, next) => {
  const errors = require("express-validator").validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((item) => item.msg);
    return res.status(400).json({ error: errorMessages });
  }
  next();
};

module.exports = {
  validateCreateTurf,
  validateUpdateTurf,
  validateCommentCreate,
  validateCommentUpdate,
  validateOTPVerification,
  validateRequest,
};
