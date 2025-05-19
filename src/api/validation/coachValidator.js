const { body, param, validationResult } = require("express-validator");

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
  body("mobile").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("specialization")
    .isString()
    .withMessage("Specialization must be a string"),
  body("experience").isInt().withMessage("Experience must be an integer"),
  body("biography").isString().withMessage("Biography must be a string"),
  body("hourly_rate").isFloat().withMessage("Hourly rate must be a float"),
  body("availability").isObject().withMessage("Availability must be an object"),
  body("certification_ids")
    .isArray()
    .withMessage("Certification IDs must be an array of integers"),
  body("review_ids")
    .optional()
    .isArray()
    .withMessage("Review IDs must be an array"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a float between 0 and 5"),
  body("reviewCount")
    .optional()
    .isInt()
    .withMessage("Review count must be an integer"),
  body("certificationLevel")
    .optional()
    .isString()
    .withMessage("Certification level must be a string"),
  body("sessionTypes")
    .optional()
    .isArray()
    .withMessage("Session types must be an array of strings"),
  body("languages")
    .optional()
    .isArray()
    .withMessage("Languages must be an array of strings"),
  body("trainedProfessionals")
    .optional()
    .isBoolean()
    .withMessage("Trained professionals must be a boolean"),
  body("shortBio")
    .optional()
    .isString()
    .withMessage("Short bio must be a string"),
  body("lessonTypes")
    .optional()
    .isObject()
    .withMessage("Lesson types must be an object"),
  body("lessonTypes.private")
    .optional()
    .isBoolean()
    .withMessage("Private lesson type must be a boolean"),
  body("lessonTypes.group")
    .optional()
    .isBoolean()
    .withMessage("Group lesson type must be a boolean"),
  body("lessonTypes.virtual")
    .optional()
    .isBoolean()
    .withMessage("Virtual lesson type must be a boolean"),
  body("lessonTypes.package")
    .optional()
    .isObject()
    .withMessage("Package must be an object"),
  body("lessonTypes.package.5_sessions")
    .optional()
    .isFloat()
    .withMessage("5_sessions package price must be a float"),
  body("lessonTypes.package.10_sessions")
    .optional()
    .isFloat()
    .withMessage("10_sessions package price must be a float"),
  body("availabilityCalendar")
    .optional()
    .isObject()
    .withMessage("Availability calendar must be an object"),
];

const validateUpdateCoach = [
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
  body("specialization")
    .optional()
    .isString()
    .withMessage("Specialization must be a string"),
  body("experience")
    .optional()
    .isInt()
    .withMessage("Experience must be an integer"),
  body("biography")
    .optional()
    .isString()
    .withMessage("Biography must be a string"),
  body("hourly_rate")
    .optional()
    .isFloat()
    .withMessage("Hourly rate must be a float"),
  body("availability")
    .optional()
    .isObject()
    .withMessage("Availability must be an object"),
  body("certification_ids")
    .optional()
    .isArray()
    .withMessage("Certification IDs must be an array of integers"),
  body("review_ids")
    .optional()
    .isArray()
    .withMessage("Review IDs must be an array"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a float between 0 and 5"),
  body("reviewCount")
    .optional()
    .isInt()
    .withMessage("Review count must be an integer"),
  body("certificationLevel")
    .optional()
    .isString()
    .withMessage("Certification level must be a string"),
  body("sessionTypes")
    .optional()
    .isArray()
    .withMessage("Session types must be an array of strings"),
  body("languages")
    .optional()
    .isArray()
    .withMessage("Languages must be an array of strings"),
  body("trainedProfessionals")
    .optional()
    .isBoolean()
    .withMessage("Trained professionals must be a boolean"),
  body("shortBio")
    .optional()
    .isString()
    .withMessage("Short bio must be a string"),
  body("lessonTypes")
    .optional()
    .isObject()
    .withMessage("Lesson types must be an object"),
  body("lessonTypes.private")
    .optional()
    .isBoolean()
    .withMessage("Private lesson type must be a boolean"),
  body("lessonTypes.group")
    .optional()
    .isBoolean()
    .withMessage("Group lesson type must be a boolean"),
  body("lessonTypes.virtual")
    .optional()
    .isBoolean()
    .withMessage("Virtual lesson type must be a boolean"),
  body("lessonTypes.package")
    .optional()
    .isObject()
    .withMessage("Package must be an object"),
  body("lessonTypes.package.5_sessions")
    .optional()
    .isFloat()
    .withMessage("5_sessions package price must be a float"),
  body("lessonTypes.package.10_sessions")
    .optional()
    .isFloat()
    .withMessage("10_sessions package price must be a float"),
  body("availabilityCalendar")
    .optional()
    .isObject()
    .withMessage("Availability calendar must be an object"),
];

// Middleware to validate request
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateOTPVerification = [
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

// Validation for creating a batch
const validateCreateBatch = [
  body("name").notEmpty().withMessage("Batch name is required"),
  body("description").optional(),
  body("sport").notEmpty().withMessage("Sport is required"),
  body("level").optional(),
  body("ageGroup").optional(),
  body("maxStudents")
    .isInt({ min: 1 })
    .withMessage("Max students must be at least 1"),
  body("fee").isFloat({ min: 0 }).withMessage("Fee must be a positive number"),
  body("feeType")
    .isIn(["session", "monthly", "package"])
    .withMessage("Invalid fee type"),
  body("startTime").notEmpty().withMessage("Start time is required"),
  body("endTime").notEmpty().withMessage("End time is required"),
  body("days")
    .isArray()
    .withMessage("Days must be an array")
    .notEmpty()
    .withMessage("At least one day must be selected"),
];

// Validation for updating a batch
const validateUpdateBatch = [
  body("name").optional(),
  body("description").optional(),
  body("sport").optional(),
  body("level").optional(),
  body("ageGroup").optional(),
  body("maxStudents")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max students must be at least 1"),
  body("fee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fee must be a positive number"),
  body("feeType")
    .optional()
    .isIn(["session", "monthly", "package"])
    .withMessage("Invalid fee type"),
  body("startTime").optional(),
  body("endTime").optional(),
  body("days").optional().isArray().withMessage("Days must be an array"),
];

// Updated validation for adding a student to a batch - userId is now optional
const validateAddStudentToBatch = [
  body("userId").optional().isUUID().withMessage("Invalid user ID"),
  // Add validation for the new fields when userId is not provided
  body("name")
    .if(body("userId").not().exists())
    .notEmpty()
    .withMessage("Student name is required when userId is not provided"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("phone").optional(),
  body("age")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Age must be a positive number"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("sport").optional(),
  body("level").optional(),
  body("guardianName").optional(),
  body("guardianMobile").optional(),
  body("address").optional(),
];

// Validation for creating a batch payment
const validateCreateBatchPayment = [
  body("userId").isUUID().withMessage("Invalid user ID"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("paymentMethod")
    .isIn(["cash", "card", "upi", "bank_transfer"])
    .withMessage("Invalid payment method"),
  body("description").optional(),
  body("paymentDate").optional().isISO8601().withMessage("Invalid date format"),
];

module.exports = {
  validateCreateCoach,
  validateUpdateCoach,
  validateRequest,
  validateOTPVerification,
  validateCreateBatch,
  validateUpdateBatch,
  validateAddStudentToBatch,
  validateCreateBatchPayment,
};
