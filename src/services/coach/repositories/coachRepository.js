const db = require("../../../database/index"); // Ensure this properly imports Sequelize models

const findById = async (coachId) => {
  return await db.CoachProfile.findByPk(coachId);
};

const findByEmail = async (email) => {
  return await db.CoachProfile.findOne({ where: { email } });
};

const findByMobile = async (mobileNumber) => {
  return await db.CoachProfile.findOne({ where: { mobile: mobileNumber } });
};

const createCoach = async (coachData) => {
  return await db.CoachProfile.create(coachData);
};

const updateCoach = async (coachId, updateData) => {
  const coach = await db.CoachProfile.findByPk(coachId);
  if (!coach) return null;
  return await coach.update(updateData);
};

const deleteCoach = async (coachId) => {
  const coach = await db.CoachProfile.findByPk(coachId);
  if (!coach) return null;
  await coach.destroy();
  return coach;
};

const findAll = async () => {
  return await db.CoachProfile.findAll();
};

module.exports = {
  findById,
  findByEmail,
  findByMobile,
  createCoach,
  updateCoach,
  deleteCoach,
  findAll,
};
