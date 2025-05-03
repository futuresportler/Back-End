// models/postgres/turf/turfGround.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfGround",
    {
      groundId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      turfId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "TurfProfiles",
          key: "turfId",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sportType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surfaceType: {
        type: DataTypes.ENUM("natural", "artificial", "hybrid"),
        defaultValue: "artificial",
      },
      dimensions: {
        type: DataTypes.JSON, // { length: number, width: number, unit: string }
        defaultValue: { length: 0, width: 0, unit: "meters" },
      },
      capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      hourlyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      halfDayRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      fullDayRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      mainImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "maintenance"),
        defaultValue: "active",
      },
    },
    { timestamps: true },
  )
}
