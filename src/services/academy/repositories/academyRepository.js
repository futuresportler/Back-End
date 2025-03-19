const db = require("../../../database/index"); // Ensure this properly imports Sequelize models

const findById = async (academyId) => {
  return await db.AcademyProfile.findByPk(academyId);
};

const findByEmail = async (email) => {
  return await db.AcademyProfile.findOne({ where: { email } });
};

const createAcademy = async (academyData) => {
  return await db.AcademyProfile.create(academyData);
};

const updateAcademy = async (academyId, updateData) => {
  const academy = await db.AcademyProfile.findByPk(academyId);
  if (!academy) return null;
  return await academy.update(updateData);
};

const deleteAcademy = async (academyId) => {
  const academy = await db.AcademyProfile.findByPk(academyId);
  if (!academy) return null;
  await academy.destroy();
  return academy;
};

module.exports = {
  findById,
  findByEmail,
  createAcademy,
  updateAcademy,
  deleteAcademy,
};
