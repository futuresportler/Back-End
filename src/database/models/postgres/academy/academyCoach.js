module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyCoach",
    {
      role: DataTypes.STRING,
      experienceLevel: DataTypes.STRING,
      sport: DataTypes.STRING,
      permissions: DataTypes.ARRAY(DataTypes.STRING),
    },
    { timestamps: false }
  );
};