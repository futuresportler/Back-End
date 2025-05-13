const { body, param } = require("express-validator")

const validateCreateCoach = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
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
  body("specialization").isString().withMessage("Specialization must be a string"),
  body("experience").isInt().withMessage("Experience must be an integer"),
  body("biography").isString().withMessage("Biography must be a string"),
  body("hourly_rate").isFloat().withMessage("Hourly rate must be a float"),
  body("availability").isObject().withMessage("Availability must be an object"),
  body("certification_ids").isArray().withMessage("Certification IDs must be an array of integers"),
  body("review_ids").optional().isArray().withMessage("Review IDs must be an array"),
  body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be a float between 0 and 5"),
  body("reviewCount").optional().isInt().withMessage("Review count must be an integer"),
  body("certificationLevel").optional().isString().withMessage("Certification level must be a string"),
  body("sessionTypes").optional().isArray().withMessage("Session types must be an array of strings"),
  body("languages").optional().isArray().withMessage("Languages must be an array of strings"),
  body("trainedProfessionals").optional().isBoolean().withMessage("Trained professionals must be a boolean"),
  body("shortBio").optional().isString().withMessage("Short bio must be a string"),
  body("lessonTypes").optional().isObject().withMessage("Lesson types must be an object"),
  body("lessonTypes.private").optional().isBoolean().withMessage("Private lesson type must be a boolean"),
  body("lessonTypes.group").optional().isBoolean().withMessage("Group lesson type must be a boolean"),
  body("lessonTypes.virtual").optional().isBoolean().withMessage("Virtual lesson type must be a boolean"),
  body("lessonTypes.package").optional().isObject().withMessage("Package must be an object"),
  body("lessonTypes.package.5_sessions").optional().isFloat().withMessage("5_sessions package price must be a float"),
  body("lessonTypes.package.10_sessions").optional().isFloat().withMessage("10_sessions package price must be a float"),
  body("availabilityCalendar").optional().isObject().withMessage("Availability calendar must be an object"),
]

const validateUpdateCoach = [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  body("password").optional().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("mobile").optional().isMobilePhone().withMessage("Invalid phone number"),
  body("profile_picture").optional().isURL().withMessage("Invalid URL"),
  body("isVerified").optional().isBoolean().withMessage("Must be a boolean"),
  body("status").optional().isIn(["active", "inactive", "banned"]).withMessage("Invalid status"),
  body("specialization").optional().isString().withMessage("Specialization must be a string"),
  body("experience").optional().isInt().withMessage("Experience must be an integer"),
  body("biography").optional().isString().withMessage("Biography must be a string"),
  body("hourly_rate").optional().isFloat().withMessage("Hourly rate must be a float"),
  body("availability").optional().isObject().withMessage("Availability must be an object"),
  body("certification_ids").optional().isArray().withMessage("Certification IDs must be an array of integers"),
  body("review_ids").optional().isArray().withMessage("Review IDs must be an array"),
  body("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("Rating must be a float between 0 and 5"),
  body("reviewCount").optional().isInt().withMessage("Review count must be an integer"),
  body("certificationLevel").optional().isString().withMessage("Certification level must be a string"),
  body("sessionTypes").optional().isArray().withMessage("Session types must be an array of strings"),
  body("languages").optional().isArray().withMessage("Languages must be an array of strings"),
  body("trainedProfessionals").optional().isBoolean().withMessage("Trained professionals must be a boolean"),
  body("shortBio").optional().isString().withMessage("Short bio must be a string"),
  body("lessonTypes").optional().isObject().withMessage("Lesson types must be an object"),
  body("lessonTypes.private").optional().isBoolean().withMessage("Private lesson type must be a boolean"),
  body("lessonTypes.group").optional().isBoolean().withMessage("Group lesson type must be a boolean"),
  body("lessonTypes.virtual").optional().isBoolean().withMessage("Virtual lesson type must be a boolean"),
  body("lessonTypes.package").optional().isObject().withMessage("Package must be an object"),
  body("lessonTypes.package.5_sessions").optional().isFloat().withMessage("5_sessions package price must be a float"),
  body("lessonTypes.package.10_sessions").optional().isFloat().withMessage("10_sessions package price must be a float"),
  body("availabilityCalendar").optional().isObject().withMessage("Availability calendar must be an object"),
]

const validateRequest = (req, res, next) => {
  const errors = require("express-validator").validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((item) => item.msg)
    return res.status(400).json({ error: errorMessages })
  }
  next()
}

const validateOTPVerification = [
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
]

const validateCreateBatch = [
  body("batchName")
    .isString()
    .withMessage("Batch name must be a string")
    .notEmpty()
    .withMessage("Batch name is required"),
  body("ageGroup").optional().isObject().withMessage("Age group must be an object"),
  body("ageGroup.minAge").optional().isInt({ min: 0 }).withMessage("Minimum age must be a positive integer"),
  body("ageGroup.maxAge").optional().isInt({ min: 0 }).withMessage("Maximum age must be a positive integer"),
  body("classType")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "professional"])
    .withMessage("Invalid class type"),
  body("daysOfWeek").isArray().withMessage("Days of week must be an array"),
  body("daysOfWeek.*").isInt({ min: 0, max: 6 }).withMessage("Days must be integers between 0 and 6"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("Start time must be in HH:MM or HH:MM:SS format"),
  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("End time must be in HH:MM or HH:MM:SS format"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("maxStudents").optional().isInt({ min: 1 }).withMessage("Maximum students must be a positive integer"),
  body("feeType").optional().isIn(["monthly", "hourly", "session"]).withMessage("Invalid fee type"),
  body("feeAmount").isFloat({ min: 0 }).withMessage("Fee amount must be a positive number"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("curriculum").optional().isObject().withMessage("Curriculum must be an object"),
  body("startDate").optional().isDate().withMessage("Start date must be a valid date"),
  body("endDate").optional().isDate().withMessage("End date must be a valid date"),
  body("isRecurring").optional().isBoolean().withMessage("Is recurring must be a boolean"),
  body("city").optional().isString().withMessage("City must be a string"),
]

const validateUpdateBatch = [
  body("batchName").optional().isString().withMessage("Batch name must be a string"),
  body("ageGroup").optional().isObject().withMessage("Age group must be an object"),
  body("ageGroup.minAge").optional().isInt({ min: 0 }).withMessage("Minimum age must be a positive integer"),
  body("ageGroup.maxAge").optional().isInt({ min: 0 }).withMessage("Maximum age must be a positive integer"),
  body("classType")
    .optional()
    .isIn(["beginner", "intermediate", "advanced", "professional"])
    .withMessage("Invalid class type"),
  body("daysOfWeek").optional().isArray().withMessage("Days of week must be an array"),
  body("daysOfWeek.*").optional().isInt({ min: 0, max: 6 }).withMessage("Days must be integers between 0 and 6"),
  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("Start time must be in HH:MM or HH:MM:SS format"),
  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage("End time must be in HH:MM or HH:MM:SS format"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("maxStudents").optional().isInt({ min: 1 }).withMessage("Maximum students must be a positive integer"),
  body("feeType").optional().isIn(["monthly", "hourly", "session"]).withMessage("Invalid fee type"),
  body("feeAmount").optional().isFloat({ min: 0 }).withMessage("Fee amount must be a positive number"),
  body("status").optional().isIn(["active", "inactive", "full"]).withMessage("Invalid status"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("curriculum").optional().isObject().withMessage("Curriculum must be an object"),
  body("startDate").optional().isDate().withMessage("Start date must be a valid date"),
  body("endDate").optional().isDate().withMessage("End date must be a valid date"),
  body("isRecurring").optional().isBoolean().withMessage("Is recurring must be a boolean"),
  body("city").optional().isString().withMessage("City must be a string"),
]

const validateAddStudentToBatch = [
  body("userId").isUUID().withMessage("User ID must be a valid UUID"),
  body("goals").optional().isString().withMessage("Goals must be a string"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
]

const validateCreateBatchPayment = [
  body("userId").isUUID().withMessage("User ID must be a valid UUID"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
  body("paymentMethod").isString().withMessage("Payment method must be a string"),
  body("transactionId").optional().isString().withMessage("Transaction ID must be a string"),
  body("paymentPeriod").optional().isObject().withMessage("Payment period must be an object"),
  body("paymentPeriod.month").optional().isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
  body("paymentPeriod.year").optional().isInt({ min: 2000 }).withMessage("Year must be valid"),
]

module.exports = {
  validateCreateCoach,
  validateUpdateCoach,
  validateRequest,
  validateOTPVerification,
  validateCreateBatch,
  validateUpdateBatch,
  validateAddStudentToBatch,
  validateCreateBatchPayment,
}
