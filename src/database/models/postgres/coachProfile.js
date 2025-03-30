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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSON, // or DataTypes.STRING
      allowNull: true,
    },
    certification_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    review_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
  {
    tableName: "Coach",
    timestamps: true,
  }
);

Coach.beforeCreate((coach) => {
  if (coach.latitude && coach.longitude) {
    coach.location = {
      type: "Point",
      coordinates: [coach.longitude, coach.latitude],
    };
  }
});

Coach.beforeUpdate((coach) => {
  if (coach.latitude && coach.longitude) {
    coach.location = {
      type: "Point",
      coordinates: [coach.longitude, coach.latitude],
    };
  }
});

module.exports = Coach;
