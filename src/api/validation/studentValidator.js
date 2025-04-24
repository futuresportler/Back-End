const { body, param, query } = require("express-validator")

const validateStudentCreation = [
  body("name").notEmpty().withMessage("Student name is required"),
  body("academyId").notEmpty().withMessage("Academy ID is required"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
  body("dateOfBirth").optional().isISO8601().withMessage("Date of birth must be a valid date"),
  body("contactPhone").optional().isMobilePhone().withMessage("Contact phone must be a valid phone number"),
  body("contactEmail").optional().isEmail().withMessage("Contact email must be a valid email"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  body("address.street").optional().isString().withMessage("Street must be a string"),
  body("address.city").optional().isString().withMessage("City must be a string"),
  body("address.state").optional().isString().withMessage("State must be a string"),
  body("address.pincode").optional().isString().withMessage("Pincode must be a string"),
  body("emergencyContact").optional().isObject().withMessage("Emergency contact must be an object"),
  body("emergencyContact.name").optional().isString().withMessage("Emergency contact name must be a string"),
  body("emergencyContact.relation").optional().isString().withMessage("Emergency contact relation must be a string"),
  body("emergencyContact.phone")
    .optional()
    .isMobilePhone()
    .withMessage("Emergency contact phone must be a valid phone number"),
  body("sport").optional().isString().withMessage("Sport must be a string"),
  body("level").optional().isString().withMessage("Level must be a string"),
  body("batchId").optional().isUUID().withMessage("Batch ID must be a valid UUID"),
  body("programId").optional().isUUID().withMessage("Program ID must be a valid UUID"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "pending", "graduated"])
    .withMessage("Status must be active, inactive, pending, or graduated"),
  body("joinedDate").optional().isISO8601().withMessage("Joined date must be a valid date"),
  body("parentInfo").optional().isObject().withMessage("Parent info must be an object"),
  body("parentInfo.fatherName").optional().isString().withMessage("Father name must be a string"),
  body("parentInfo.motherName").optional().isString().withMessage("Mother name must be a string"),
  body("parentInfo.fatherOccupation").optional().isString().withMessage("Father occupation must be a string"),
  body("parentInfo.motherOccupation").optional().isString().withMessage("Mother occupation must be a string"),
  body("parentInfo.fatherPhone").optional().isMobilePhone().withMessage("Father phone must be a valid phone number"),
  body("parentInfo.motherPhone").optional().isMobilePhone().withMessage("Mother phone must be a valid phone number"),
  body("parentInfo.fatherEmail").optional().isEmail().withMessage("Father email must be a valid email"),
  body("parentInfo.motherEmail").optional().isEmail().withMessage("Mother email must be a valid email"),
  body("medicalInfo").optional().isObject().withMessage("Medical info must be an object"),
  body("medicalInfo.bloodGroup").optional().isString().withMessage("Blood group must be a string"),
  body("medicalInfo.allergies").optional().isArray().withMessage("Allergies must be an array"),
  body("medicalInfo.medications").optional().isArray().withMessage("Medications must be an array"),
  body("medicalInfo.conditions").optional().isArray().withMessage("Conditions must be an array"),
  body("documents").optional().isArray().withMessage("Documents must be an array"),
  body("documents.*.type").optional().isString().withMessage("Document type must be a string"),
  body("documents.*.url").optional().isURL().withMessage("Document URL must be a valid URL"),
  body("documents.*.name").optional().isString().withMessage("Document name must be a string"),
  body("documents.*.uploadedAt").optional().isISO8601().withMessage("Document uploaded at must be a valid date"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
]

const validateStudentUpdate = [
  param("studentId").isUUID().withMessage("Student ID must be a valid UUID"),
  body("name").optional().notEmpty().withMessage("Student name cannot be empty"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
  body("dateOfBirth").optional().isISO8601().withMessage("Date of birth must be a valid date"),
  body("contactPhone").optional().isMobilePhone().withMessage("Contact phone must be a valid phone number"),
  body("contactEmail").optional().isEmail().withMessage("Contact email must be a valid email"),
  body("address").optional().isObject().withMessage("Address must be an object"),
  body("sport").optional().isString().withMessage("Sport must be a string"),
  body("level").optional().isString().withMessage("Level must be a string"),
  body("batchId").optional().isUUID().withMessage("Batch ID must be a valid UUID"),
  body("programId").optional().isUUID().withMessage("Program ID must be a valid UUID"),
  body("status")
    .optional()
    .isIn(["active", "inactive", "pending", "graduated"])
    .withMessage("Status must be active, inactive, pending, or graduated"),
  body("parentInfo").optional().isObject().withMessage("Parent info must be an object"),
  body("medicalInfo").optional().isObject().withMessage("Medical info must be an object"),
  body("documents").optional().isArray().withMessage("Documents must be an array"),
  body("notes").optional().isString().withMessage("Notes must be a string"),
]

const validateStudentFilters = [
  query("name").optional().isString().withMessage("Name filter must be a string"),
  query("sport").optional().isString().withMessage("Sport filter must be a string"),
  query("status")
    .optional()
    .isIn(["active", "inactive", "pending", "graduated"])
    .withMessage("Status must be active, inactive, pending, or graduated"),
  query("batchId").optional().isUUID().withMessage("Batch ID must be a valid UUID"),
  query("programId").optional().isUUID().withMessage("Program ID must be a valid UUID"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
]

module.exports = {
  validateStudentCreation,
  validateStudentUpdate,
  validateStudentFilters,
}
