const { AcademyProfile, Supplier } = require("../../../database");

const findAcademyProfileById = async (academyProfileId) => {
  return await AcademyProfile.findByPk(academyProfileId, {
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile", "profilePicture", "location"],
      },
    ],
  });
};

const findAcademiesBySupplierId = async (supplierId) => {
  return await AcademyProfile.findAll({
    where: { supplierId },
    include: ["supplier"],
  });
};

const createAcademyProfile = async (profileData) => {
  return await AcademyProfile.create(profileData);
};

const updateAcademyProfile = async (academyProfileId, updateData) => {
  const profile = await AcademyProfile.findByPk(academyProfileId);
  if (!profile) return null;
  return await profile.update(updateData);
};

const deleteAcademy = async (academyId) => {
  const academy = await db.AcademyProfile.findByPk(academyId);
  if (!academy) return null;
  await academy.destroy();
  return academy;
};

const findAcademiesNearby = async (latitude, longitude, radius) => {
  return await AcademyProfile.findAll({
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
  findAcademyProfileById,
  findAcademiesBySupplierId,
  createAcademyProfile,
  updateAcademyProfile,
  findAcademiesNearby,
};
