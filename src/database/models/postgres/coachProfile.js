const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");
const User = require("./user");

const CoachProfile = sequelize.define("CoachProfile", {
  coachId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
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
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  experience_years: {
    type: DataTypes.INTEGER,
  },
  biography: {
    type: DataTypes.TEXT,
  },
  hourly_rate: {
    type: DataTypes.FLOAT,
  },
  availability: {
    type: DataTypes.JSON,
  },
  location: {
    type: DataTypes.STRING,
  },
  certification_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
}, {
  tableName: "CoachProfile",
  timestamps: true,
});

module.exports = CoachProfile;
