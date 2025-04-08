// models/postgres/coachProfile.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CoachProfile = sequelize.define("CoachProfile", {
    coachProfileId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Suppliers',
        key: 'supplierId'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specialization: DataTypes.STRING,
    experience: DataTypes.INTEGER,
    hourlyRate: DataTypes.FLOAT,
    biography: DataTypes.TEXT,
    certificationIds: DataTypes.ARRAY(DataTypes.STRING),
    availability: DataTypes.JSON
  });

  return CoachProfile;
};