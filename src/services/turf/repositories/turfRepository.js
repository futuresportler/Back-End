const db = require("../../../database/index"); // Ensure this properly imports Sequelize models

const findById = async (turfId) => {
  return await db.TurfProfile.findByPk(turfId);
};

const findByEmail = async (email) => {
  return await db.TurfProfile.findOne({ where: { email } });
};

const findByMobile = async (mobileNumber) => {
  return await db.TurfProfile.findOne({ where: { mobile: mobileNumber } });
};

const createTurf = async (turfData) => {
  return await db.TurfProfile.create(turfData);
};

const updateTurf = async (turfId, updateData) => {
  const turf = await db.TurfProfile.findByPk(turfId);
  if (!turf) return null;
  return await turf.update(updateData);
};

const deleteTurf = async (turfId) => {
  const turf = await db.TurfProfile.findByPk(turfId);
  if (!turf) return null;
  await turf.destroy();
  return turf;
};

const findAll = async () => {
  return await db.TurfProfile.findAll();
};

module.exports = {
  findById,
  findByEmail,
  findByMobile,
  createTurf,
  updateTurf,
  deleteTurf,
  findAll,
};
