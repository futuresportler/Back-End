const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const Coach = sequelize.define(
  "Coach",
  {
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
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isOAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    firebaseUID: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
  },
  {
    tableName: "Coach",
    timestamps: true,
  }
);

module.exports = Coach;
