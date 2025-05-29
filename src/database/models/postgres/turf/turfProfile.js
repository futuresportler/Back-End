// models/postgres/turfProfile.js (Main Turf Table)
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfProfile",
    {
      turfId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "supplierId",
        },
        onDelete: "CASCADE",
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      turfType: {
        type: DataTypes.ENUM("indoor", "outdoor", "hybrid"),
        defaultValue: "outdoor",
      },
      sportsAvailable: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      facilities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      openingTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      closingTime: {
        type: DataTypes.TIME,
        allowNull: false,
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
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0.0,
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "maintenance", "closed"),
        defaultValue: "active",
      },
      // Priority for sorting
      priority: {
        type: DataTypes.JSON,
        defaultValue: { value: 0, reason: "standard" },
        allowNull: false,
      },
      notifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      bookingRequestNotifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      }
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
