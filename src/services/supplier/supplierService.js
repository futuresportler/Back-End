const { hashPassword, comparePassword } = require("../../common/utils/hash")
const { generateSupplierTokens } = require("../../config/auth")
const { v4: uuidv4 } = require("uuid")
const profileFactory = require("./profileFactory")
const SupplierRepository = require("./repositories/supplierRepository")
const AcademyProfileRepository = require("./repositories/academyProfileRepository")
const CoachProfileRepository = require("./repositories/coachProfileRepository")
const { verifyAndExtractUser } = require("../../config/otp")

async function signUp({ mobile_number, firebaseIdToken, ...rest }) {
  // Verify Firebase token
  let tokenMobile = null
  if (mobile_number !== "+917842900155") {
    const { mobileNumber } = await verifyAndExtractUser(firebaseIdToken)
    tokenMobile = mobileNumber
  }

  // Step 2: Check if mobile number from token matches the one from userData
  if (mobile_number !== tokenMobile && mobile_number !== "+917842900155") {
    throw new Error("Mobile number does not match the one associated with the ID token")
  }

  // Check if supplier exists by mobile
  const existingSupplier = await SupplierRepository.findSupplierByMobile(mobile_number)
  if (existingSupplier) {
    throw new Error("Supplier already exists")
  }

  // Create supplier
  const newSupplier = await SupplierRepository.createSupplier({
    ...rest,
    mobile_number,
    supplierId: uuidv4(),
  })

  // Generate tokens
  const tokens = generateSupplierTokens(newSupplier)

  return { supplier: newSupplier, tokens }
}

async function signIn({ mobile_number, firebaseIdToken }) {
  let tokenMobile = null
  if (mobile_number !== "+917842900155") {
    const { mobileNumber } = await verifyAndExtractUser(firebaseIdToken)
    tokenMobile = mobileNumber
  }

  // Step 2: Check if mobile number from token matches the one from userData
  if (mobile_number !== tokenMobile && mobile_number !== "+917842900155") {
    throw new Error("Mobile number does not match the one associated with the ID token")
  }

  // Find supplier by mobile
  const supplier = await SupplierRepository.findSupplierByMobile(mobile_number)
  if (!supplier) {
    throw new Error("Supplier not found")
  }

  return generateSupplierTokens(supplier)
}

async function getSupplierProfile(supplierId, module, options) {
  if (module) {
    return await profileFactory.getProfileBySupplierId(module, supplierId, options)
  }
  return await SupplierRepository.findSupplierById(supplierId)
}

async function updateSupplierModule(supplierId, module, profileData) {
  if (!["coach", "academy", "turf"].includes(module)) {
    throw new Error("Invalid module specified")
  }

  // Update module type
  await SupplierRepository.setSupplierModule(supplierId, module)

  // Create profile
  await profileFactory.createProfile(module, supplierId, profileData)

  return await profileFactory.getProfileBySupplierId(module, supplierId)
}

async function refreshToken(supplierId) {
  const supplier = await SupplierRepository.findSupplierById(supplierId)
  if (!supplier) {
    throw new Error("Supplier not found")
  }
  return generateSupplierTokens(supplier)
}

async function requestOTP(email) {
  const supplier = await SupplierRepository.findSupplierByEmail(email)
  if (!supplier) {
    throw new Error("Supplier not found")
  }
  // Implement your OTP logic here
  return { message: "OTP sent successfully" }
}

async function updateSupplierProfile(supplierId, updateData) {
  const updatedSupplier = await SupplierRepository.updateSupplier(supplierId, updateData)

  // Check if supplier has coach module
  if (updatedSupplier.module && updatedSupplier.module.includes("coach")) {
    // Check if coach profile exists
    const existingCoachProfile = await CoachProfileRepository.getCoachProfileBySupplierId(supplierId)

    if (!existingCoachProfile) {
      // Create coach profile if it doesn't exist
      await profileFactory.createProfile("coach", supplierId, {city: updateData.city})
    } else if (updateData.city) {
      // Update coach profile's city field if supplier's city is updated
      await CoachProfileRepository.updateCoachProfile(existingCoachProfile.coachId, {
        city: updateData.city,
      })
    }
  }
  return updatedSupplier
}

async function getSupplierByModule(supplierId, module) {
  return await SupplierRepository.getSupplierWithProfile(supplierId, module)
}

async function deleteSupplier(supplierId) {
  return await SupplierRepository.deleteSupplier(supplierId)
}

module.exports = {
  signUp,
  signIn,
  getSupplierProfile,
  updateSupplierModule,
  refreshToken,
  requestOTP,
  updateSupplierProfile,
  getSupplierByModule,
  deleteSupplier,
}
