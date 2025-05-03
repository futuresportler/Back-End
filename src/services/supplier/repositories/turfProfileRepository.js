const { TurfProfile } = require("../../../database");

async function createTurfProfile(data) {
  return await TurfProfile.create(data);
}

async function updateTurfProfile(profileId, updateData) {
  return await TurfProfile.update(updateData, {
    where: { turfProfileId: profileId },
    returning: true,
  });
}

async function getTurfProfileBySupplierId(supplierId) {
  return await TurfProfile.findOne({ where: { supplierId } });
}

async function deleteTurfProfile(profileId) {
  return await TurfProfile.destroy({ where: { turfProfileId: profileId } });
}

module.exports = {
  createTurfProfile,
  updateTurfProfile,
  getTurfProfileBySupplierId,
  deleteTurfProfile,
};
