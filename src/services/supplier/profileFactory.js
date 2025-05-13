const CoachRepo = require("./repositories/coachProfileRepository")
const AcademyRepo = require("./repositories/academyProfileRepository")
const TurfRepo = require("./repositories/turfProfileRepository")
const SupplierRepo = require("./repositories/supplierRepository")

async function createProfile(module, supplierId, data) {
  // Get supplier data to copy relevant fields
  const supplier = await SupplierRepo.findSupplierById(supplierId)
  if (!supplier) {
    throw new Error("Supplier not found")
  }

  const payload = { ...data, supplierId }

  switch (module) {
    case "coach":
      return await CoachRepo.createCoachProfile(payload)
    case "academy":
      return await AcademyRepo.createAcademyProfile(payload)
    case "turf":
      return await TurfRepo.createTurfProfile(payload)
    default:
      throw new Error("Invalid module")
  }
}

async function updateProfile(module, profileId, data) {
  switch (module) {
    case "coach":
      return await CoachRepo.updateCoachProfile(profileId, data)
    case "academy":
      return await AcademyRepo.updateAcademyProfile(profileId, data)
    case "turf":
      return await TurfRepo.updateTurfProfile(profileId, data)
    default:
      throw new Error("Invalid module")
  }
}

async function getProfileBySupplierId(module, supplierId, options = {}) {
  switch (module) {
    case "coach":
      return await CoachRepo.getCoachProfileBySupplierId(supplierId)
    case "academy":
      return await AcademyRepo.getAcademyProfileBySupplierId(supplierId, options)
    case "turf":
      return await TurfRepo.getTurfProfileBySupplierId(supplierId)
    default:
      throw new Error("Invalid module")
  }
}

async function deleteProfile(module, profileId) {
  switch (module) {
    case "coach":
      return await CoachRepo.deleteCoachProfile(profileId)
    case "academy":
      return await AcademyRepo.deleteAcademyProfile(profileId)
    case "turf":
      return await TurfRepo.deleteTurfProfile(profileId)
    default:
      throw new Error("Invalid module")
  }
}

module.exports = {
  createProfile,
  updateProfile,
  getProfileBySupplierId,
  deleteProfile,
}
