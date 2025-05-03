const { body, param } = require("express-validator");

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
  body("experience")
    .isInt()
    .withMessage("Experience must be an integer"),
  body("biography")
    .isString()
    .withMessage("Biography must be a string"),
  body("hourly_rate")
    .isFloat()
    .withMessage("Hourly rate must be a float"),
  body("availability")
    .isObject()
    .withMessage("Availability must be an object"),
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
  validateCreateCoach,
  validateUpdateCoach,
  validateRequest,
  validateOTPVerification,
};
