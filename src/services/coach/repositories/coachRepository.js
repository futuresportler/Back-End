const { CoachProfile, Supplier } = require("../../../database");

const findCoachProfileById = async (coachProfileId) => {
  return await CoachProfile.findByPk(coachProfileId, {
    include: [{
      model: Supplier,
      as: 'supplier',
      attributes: ['email', 'mobile', 'profilePicture', 'location']
    }]
  });
};

const findCoachBySupplierId = async (supplierId) => {
  return await CoachProfile.findOne({ 
    where: { supplierId },
    include: ['supplier']
  });
};

const createCoachProfile = async (profileData) => {
  return await CoachProfile.create(profileData);
};

const updateCoachProfile = async (coachProfileId, updateData) => {
  const profile = await CoachProfile.findByPk(coachProfileId);
  if (!profile) return null;
  return await profile.update(updateData);
};

const deleteCoachProfile = async (coachProfileId) => {
  const profile = await CoachProfile.findByPk(coachProfileId);
  if (!profile) return null;
  await profile.destroy();
  return profile;
};

const findCoachesNearby = async (latitude, longitude, radius) => {
  return await CoachProfile.findAll({
    include: [{
      model: Supplier,
      as: 'supplier',
      where: sequelize.where(
        sequelize.fn(
          'ST_DWithin',
          sequelize.col('supplier.location'),
          sequelize.fn('ST_SetSRID', 
            sequelize.fn('ST_MakePoint', longitude, latitude), 
            4326
          ),
          radius
        ),
        true
      )
    }]
  });
};

module.exports = {
  findCoachProfileById,
  findCoachBySupplierId,
  createCoachProfile,
  updateCoachProfile,
  deleteCoachProfile,
  findCoachesNearby
};