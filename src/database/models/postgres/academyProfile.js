// models/postgres/academyProfile.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AcademyProfile = sequelize.define("AcademyProfile", {
    academyProfileId: {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sportType: DataTypes.STRING,
    description: DataTypes.TEXT,
    facilities: DataTypes.JSON,
    sportsOffered: DataTypes.ARRAY(DataTypes.STRING),
    foundingYear: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    }
  });

  return AcademyProfile;
};