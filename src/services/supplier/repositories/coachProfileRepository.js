const { CoachProfile, Supplier } = require("../../../database")

async function createCoachProfile(profileData) {
  // Check if a profile already exists for this supplier
  const existingProfile = await CoachProfile.findOne({
    where: { supplierId: profileData.supplierId },
  })

  if (existingProfile) {
    // Update existing profile instead of creating a new one
    return await existingProfile.update(profileData)
  }

  // Create new profile if none exists
  return await CoachProfile.create(profileData)
}

async function getCoachProfileBySupplierId(supplierId) {
  return await CoachProfile.findOne({
    where: { supplierId },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: [
          "name",
          "email",
          "mobile_number",
          "profilePicture",
          "location",
          "address",
          "city",
          "state",
          "pincode",
          "idType",
          "idNumber",
          "idImageLink",
          "dob",
          "bio",
        ],
      },
    ],
  })
}

const updateCoachProfile = async (coachId, updateData) => {
  return await CoachProfile.update(updateData, {
    where: { id: coachId },
  })
}

async function deleteCoachProfile(coachId) {
  const profile = await CoachProfile.findByPk(coachId)
  if (!profile) return null
  await profile.destroy()
  return profile
}

module.exports = {
  createCoachProfile,
  getCoachProfileBySupplierId,
  updateCoachProfile,
  deleteCoachProfile,
}
