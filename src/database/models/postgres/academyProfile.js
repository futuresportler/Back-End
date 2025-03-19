const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const User = require("./user");

const AcademyProfile = sequelize.define("AcademyProfile", {
  academyId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sport_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  description: { 
    type: DataTypes.TEXT,
    allowNull: true,
  },
  address: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  facilities: { 
    type: DataTypes.JSON,
    allowNull: true,
  },
  sports_offered: { 
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  founding_year: { 
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1800,
      max: new Date().getFullYear(),
    },
  },
  contact_email: { 
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  contact_phone: { 
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]+$/i,
    },
  },
});

module.exports = AcademyProfile;
