// models/postgres/turfProfile.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TurfProfile = sequelize.define("TurfProfile", {
    turfProfileId: {
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
    description: DataTypes.TEXT,
    address: DataTypes.STRING,
    facilities: DataTypes.JSON,
    sportsSupported: DataTypes.ARRAY(DataTypes.STRING),
    hourlyRate: DataTypes.FLOAT,
    images: DataTypes.ARRAY(DataTypes.STRING),
    establishmentYear: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    }
  });

  return TurfProfile;
};