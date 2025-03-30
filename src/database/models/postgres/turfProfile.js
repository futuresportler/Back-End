const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database");

const TurfProfile = sequelize.define("TurfProfile", {
  turfId: {
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
    allowNull: false,
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  sports_supported: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  hourly_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  review_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
  establishment_year: {
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

TurfProfile.beforeCreate((turf) => {
  if (turf.latitude && turf.longitude) {
    turf.location = {
      type: "Point",
      coordinates: [turf.longitude, turf.latitude],
    };
  }
});

TurfProfile.beforeUpdate((turf) => {
  if (turf.latitude && turf.longitude) {
    turf.location = {
      type: "Point",
      coordinates: [turf.longitude, turf.latitude],
    };
  }
});

module.exports = TurfProfile;
