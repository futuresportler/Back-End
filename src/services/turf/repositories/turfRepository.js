const { TurfProfile, Supplier } = require("../../../database");

const findTurfProfileById = async (turfProfileId) => {
  return await TurfProfile.findByPk(turfProfileId, {
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile", "profilePicture", "location"],
      },
    ],
  });
};

const findTurfsBySupplierId = async (supplierId) => {
  return await TurfProfile.findAll({
    where: { supplierId },
    include: ["supplier"],
  });
};

const createTurfProfile = async (profileData) => {
  return await TurfProfile.create(profileData);
};

const updateTurfProfile = async (turfProfileId, updateData) => {
  const profile = await TurfProfile.findByPk(turfProfileId);
  if (!profile) return null;
  return await profile.update(updateData);
};

const deleteTurfProfile = async (turfProfileId) => {
  const profile = await TurfProfile.findByPk(turfProfileId);
  if (!profile) return null;
  await profile.destroy();
  return profile;
};

const findTurfsNearby = async (latitude, longitude, radius) => {
  return await TurfProfile.findAll({
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn(
              "ST_SetSRID",
              sequelize.fn("ST_MakePoint", longitude, latitude),
              4326
            ),
            radius
          ),
          true
        ),
      },
    ],
  });
};

module.exports = {
  findTurfProfileById,
  findTurfsBySupplierId,
  createTurfProfile,
  updateTurfProfile,
  deleteTurfProfile,
  findTurfsNearby,
};
