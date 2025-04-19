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
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      openingTime: DataTypes.TIME,
      closingTime: DataTypes.TIME,
      status: {
        type: DataTypes.ENUM("active", "maintenance", "closed"),
        defaultValue: "active",
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
