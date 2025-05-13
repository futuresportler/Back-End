const Joi = require("joi")

// Base schema for supplier
const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  mobile_number: Joi.string().required(),
  profilePicture: Joi.string().uri().allow(null, ""),
  address: Joi.string().allow(null, ""),
  city: Joi.string().allow(null, ""),
  state: Joi.string().allow(null, ""),
  pincode: Joi.string().allow(null, ""),
  businessName: Joi.string().allow(null, ""),
  bio: Joi.string().allow(null, ""),
  idType: Joi.string().valid("aadhar", "pan", "voter", "driving", "passport").allow(null),
  idNumber: Joi.string().allow(null, ""),
  idImageLink: Joi.string().uri().allow(null, ""),
  dob: Joi.date().allow(null),
  isVerified: Joi.boolean(),
  isOAuth: Joi.boolean(),
  firebaseUID: Joi.string().allow(null, ""),
  role: Joi.string().valid("owner", "employee", "reviewer", "manager", "admin"),
  module: Joi.array().items(Joi.string().valid("coach", "academy", "turf")),
  location: Joi.object().allow(null),
  status: Joi.string().valid("active", "inactive", "suspended"),
  gstNumber: Joi.string().allow(null, ""),
  bankAccountNumber: Joi.string().allow(null, ""),
  accountHolderName: Joi.string().allow(null, ""),
  ifscCode: Joi.string().allow(null, ""),
  upiId: Joi.string().allow(null, ""),
  firebaseIdToken: Joi.string().required(),
})

// Coach data schema
const coachDataSchema = Joi.object({
  bio: Joi.string().allow(null, ""),
  hourlyRate: Joi.number().min(0).allow(null),
  minHourlyRate: Joi.number().min(0).allow(null),
  sportId: Joi.string().allow(null),
  experienceYears: Joi.number().integer().min(0).allow(null),
  dob: Joi.date().allow(null),
  sportsCoached: Joi.array().items(Joi.string()).allow(null),
  maximumLevelPlayed: Joi.string().allow(null, ""),
  ageGroups: Joi.object().allow(null),
  classType: Joi.object().allow(null),
  references: Joi.array().items(Joi.object()).allow(null),
  mediaLinks: Joi.object().allow(null),
  photos: Joi.array().items(Joi.string()).allow(null),
  videos: Joi.array().items(Joi.string()).allow(null),
  qualifications: Joi.array().items(Joi.string()).allow(null),
  certifications: Joi.array().items(Joi.object()).allow(null),
  achievements: Joi.array().items(Joi.string()).allow(null),
})

// Signup validation
const validateSignup = (req, res, next) => {
  const { error } = supplierSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

// Update profile validation
const validateUpdateProfile = (req, res, next) => {
  // Create a schema without required fields for update
  const updateSchema = supplierSchema.fork(["mobile_number", "firebaseIdToken"], (schema) => schema.optional())

  // If coachData is present, validate it
  if (req.body.coachData) {
    const { error: coachError } = coachDataSchema.validate(req.body.coachData)
    if (coachError) {
      return res.status(400).json({ error: coachError.details[0].message })
    }
  }

  const { error } = updateSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

// Set module validation
const validateSetModule = (req, res, next) => {
  const schema = Joi.object({
    module: Joi.string().valid("coach", "academy", "turf").required(),
    profileData: Joi.object().required(),
  })

  // If module is coach, validate profileData with coachDataSchema
  if (req.body.module === "coach") {
    const { error: coachError } = coachDataSchema.validate(req.body.profileData)
    if (coachError) {
      return res.status(400).json({ error: coachError.details[0].message })
    }
  }

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

module.exports = {
  validateSignup,
  validateUpdateProfile,
  validateSetModule,
}
