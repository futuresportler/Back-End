const db = require("../../../database/index"); // Ensure this properly imports Sequelize models
const { Op, Sequelize } = require("sequelize");

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

const findAll = async ({ page = 1, limit = 10, latitude, longitude }) => {
  const offset = (page - 1) * limit;

  const whereCondition = {}; // Add any filters here

  let order = [];

  if (latitude && longitude) {
    order = [
      [
        Sequelize.fn(
          "ST_Distance",
          Sequelize.col("location"),
          Sequelize.fn("ST_SetSRID", Sequelize.fn("ST_MakePoint", longitude, latitude), 4326)
        ),
        "ASC",
      ],
    ];
  }

  const { rows, count } = await db.CoachProfile.findAndCountAll({
    where: whereCondition,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalCoaches: count,
    coaches: rows,
  };
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
