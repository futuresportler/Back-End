const db = require("../../../database/index"); // Ensure this properly imports Sequelize models
const { Op, Sequelize } = require("sequelize");

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

const findAll = async ({ page = 1, limit = 10, latitude, longitude }) => {
  const offset = (page - 1) * limit;

  const whereCondition = {}; // Add any filters here

  // Skip location-based sorting for now
  const { rows, count } = await db.AcademyProfile.findAndCountAll({
    where: whereCondition,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalAcademies: count,
    academies: rows,
  };
};

module.exports = {
  findById,
  findByEmail,
  createAcademy,
  updateAcademy,
  deleteAcademy,
  findAll,
};
