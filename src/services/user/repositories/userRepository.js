const db = require("../../../database/index"); // Ensure this properly imports Sequelize models

const findAll = async () => {
  return await db.User.findAll();
};

const findById = async (userId) => {
  return await db.User.findByPk(userId);
};

const findByMobile = async (mobile) => {
  return await db.User.findOne({ where: { mobile } });
};

const createUser = async (userData) => {
  return await db.User.create(userData);
};

const updateUser = async (userId, updateData) => {
  const user = await db.User.findByPk(userId);
  if (!user) return null;
  return await user.update(updateData);
};

const deleteUser = async (userId) => {
  const user = await db.User.findByPk(userId);
  if (!user) return null;
  await user.destroy();
  return user;
};

module.exports = {
  findAll,
  findById,
  findByMobile,
  createUser,
  updateUser,
  deleteUser,
};
