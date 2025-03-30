const db = require("../../../database/index"); // Ensure this properly imports Sequelize models
const { Op, Sequelize } = require("sequelize");

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

const findAll = async ({ page = 1, limit = 10, latitude, longitude }) => {
  const offset = (page - 1) * limit;

  const whereCondition = {}; // Add any filters here

  let order = [];

  // Check if PostGIS is available and coordinates are provided
  try {
    if (latitude && longitude) {
      // Test if ST_Distance is available
      await db.sequelize.query(
        "SELECT ST_Distance(ST_SetSRID(ST_MakePoint(0, 0), 4326), ST_SetSRID(ST_MakePoint(1, 1), 4326))"
      );

      order = [
        [
          Sequelize.fn(
            "ST_Distance",
            Sequelize.col("location"),
            Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_MakePoint", longitude, latitude),
              4326
            )
          ),
          "ASC",
        ],
      ];
    }
  } catch (error) {
    console.warn(
      "PostGIS functions not available. Location-based sorting disabled."
    );

    // Fallback to basic sorting if latitude/longitude columns exist
    if (
      latitude &&
      longitude &&
      db.TurfProfile.rawAttributes.latitude &&
      db.TurfProfile.rawAttributes.longitude
    ) {
      order = Sequelize.literal(`
        SQRT(
          POWER(latitude - ${parseFloat(latitude)}, 2) + 
          POWER(longitude - ${parseFloat(longitude)}, 2)
        ) ASC
      `);
    }
  }

  const { rows, count } = await db.TurfProfile.findAndCountAll({
    where: whereCondition,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalTurfs: count,
    turfs: rows,
  };
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
