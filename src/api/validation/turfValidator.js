const { body, param, query } = require("express-validator");

const validateTurfProfile = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),
  body("city")
    .isString()
    .withMessage("City must be a string")
    .notEmpty()
    .withMessage("City is required"),
  body("fullAddress")
    .isString()
    .withMessage("Full address must be a string")
    .notEmpty()
    .withMessage("Full address is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("contactPhone")
    .isString()
    .withMessage("Contact phone must be a string")
    .notEmpty()
    .withMessage("Contact phone is required"),
  body("contactEmail")
    .isEmail()
    .withMessage("Invalid email format")
    .notEmpty()
    .withMessage("Contact email is required"),
  body("turfType")
    .isIn(["indoor", "outdoor", "hybrid"])
    .withMessage("Turf type must be indoor, outdoor, or hybrid"),
  body("sportsAvailable")
    .isArray()
    .withMessage("Sports available must be an array")
    .notEmpty()
    .withMessage("Sports available is required"),
  body("facilities")
    .optional()
    .isArray()
    .withMessage("Facilities must be an array"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
  body("openingTime")
    .isString()
    .withMessage("Opening time must be a string")
    .notEmpty()
    .withMessage("Opening time is required"),
  body("closingTime")
    .isString()
    .withMessage("Closing time must be a string")
    .notEmpty()
    .withMessage("Closing time is required"),
  body("hourlyRate")
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number")
    .notEmpty()
    .withMessage("Hourly rate is required"),
  body("halfDayRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Half day rate must be a positive number"),
  body("fullDayRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Full day rate must be a positive number"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("mainImage")
    .optional()
    .isString()
    .withMessage("Main image must be a string"),
];

const validateNearbyQuery = [
  query("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90"),
  query("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180"),
  query("radius")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Radius must be a positive number"),
];

const validateImageUpload = [
  body("imageUrl").isURL().withMessage("Image URL must be a valid URL"),
  body("isMainImage")
    .optional()
    .isBoolean()
    .withMessage("isMainImage must be a boolean"),
];

const validateBookingRequestAction = [
  body("action")
    .isIn(["accept", "decline"])
    .withMessage("Action must be either 'accept' or 'decline'"),
];

const validateReview = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .isString()
    .withMessage("Comment must be a string")
    .notEmpty()
    .withMessage("Comment is required"),
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
  validateTurfProfile,
  validateNearbyQuery,
  validateImageUpload,
  validateBookingRequestAction,
  validateReview,
  validateRequest,
};
