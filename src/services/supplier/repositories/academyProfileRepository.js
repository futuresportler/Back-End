const { AcademyProfile } = require("../../../database");

async function createAcademyProfile(data) {
  return await AcademyProfile.create(data);
}

async function updateAcademyProfile(profileId, updateData) {
  return await AcademyProfile.update(updateData, {
    where: { academyProfileId: profileId },
    returning: true,
  });
}

async function getAcademyProfileBySupplierId(supplierId) {
  return await AcademyProfile.findOne({ where: { supplierId } });
}

async function deleteAcademyProfile(profileId) {
  return await AcademyProfile.destroy({ where: { academyProfileId: profileId } });
}

module.exports = {
  createAcademyProfile,
  updateAcademyProfile,
  getAcademyProfileBySupplierId,
  deleteAcademyProfile,
};
