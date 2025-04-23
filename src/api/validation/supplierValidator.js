const { body } = require("express-validator")

const validateModuleCreation = [
  body("module").isString().isIn(["coach", "academy", "turf"]).withMessage("Invalid module type"),
  body("profileData").isObject().withMessage("Profile data must be an object"),

  // Basic validation for academy module
  body("profileData.basic_info")
    .if(body("module").equals("academy"))
    .isObject()
    .withMessage("Basic info must be an object"),
  body("profileData.sports_details")
    .if(body("module").equals("academy"))
    .isObject()
    .withMessage("Sports details must be an object"),

  // Validate required fields
  body("profileData.basic_info.academy_name")
    .if(body("module").equals("academy"))
    .notEmpty()
    .withMessage("Academy name is required"),
  body("profileData.basic_info.contact_phone")
    .if(body("module").equals("academy"))
    .notEmpty()
    .withMessage("Contact phone is required"),
  body("profileData.basic_info.contact_email")
    .if(body("module").equals("academy"))
    .isEmail()
    .withMessage("Valid contact email is required"),

  // Validate coaches have required fields
  body("profileData.coaches")
    .if(body("module").equals("academy"))
    .isArray()
    .withMessage("Coaches must be an array"),
  body("profileData.coaches.*.coach_name")
    .if(body("module").equals("academy"))
    .notEmpty()
    .withMessage("Coach name is required"),
  body("profileData.coaches.*.email")
    .if(body("module").equals("academy"))
    .isEmail()
    .withMessage("Valid coach email is required"),
  body("profileData.coaches.*.mobileNumber")
    .if(body("module").equals("academy"))
    .notEmpty()
    .withMessage("Coach mobile number is required"),
]

module.exports = {
  validateModuleCreation,
  // Include other validators you already have
}
