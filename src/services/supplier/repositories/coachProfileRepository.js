const { CoachProfile } = require("../../../database");

async function createCoachProfile(data) {
  const existingCoach = await getCoachProfileBySupplierId(data.supplierId);
  if (existingCoach) {
    throw new Error("A coach profile already exists for this supplier.");
  }
  return await CoachProfile.create(data);
}

async function updateCoachProfile(profileId, updateData) {
  return await CoachProfile.update(updateData, {
    where: { coachProfileId: profileId },
    returning: true,
  });
}

async function getCoachProfileBySupplierId(supplierId) {
  return await CoachProfile.findOne({ where: { supplierId } });
}

async function deleteCoachProfile(profileId) {
  return await CoachProfile.destroy({ where: { coachProfileId: profileId } });
}

module.exports = {
  createCoachProfile,
  updateCoachProfile,
  getCoachProfileBySupplierId,
  deleteCoachProfile,
};
