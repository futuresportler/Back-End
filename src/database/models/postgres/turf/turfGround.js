// models/postgres/turfGround.js
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
        onDelete: "CASCADE",
      },
      groundName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sportType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "The specific sport this ground is designed for",
      },
      surfaceType: {
        type: DataTypes.ENUM("natural", "artificial", "hybrid"),
        defaultValue: "artificial",
      },
      capacity: DataTypes.INTEGER,
      dimensions: {
        type: DataTypes.STRING,
        comment: "Dimensions of the ground (e.g., '100x60m')",
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
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      mainImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        comment: "Specific amenities for this ground (e.g., 'floodlights', 'scoreboard')",
      },
      status: {
        type: DataTypes.ENUM("active", "maintenance", "closed"),
        defaultValue: "active",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    { timestamps: true },
  )
}
