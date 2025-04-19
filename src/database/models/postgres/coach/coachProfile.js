// models/postgres/coachProfile.js (Main Coach Table)
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachProfile",
    {
      coachId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      bio: DataTypes.TEXT,
      hourlyRate: DataTypes.DECIMAL(10, 2),
      certificationId: {
        type: DataTypes.UUID, // References Certification table
        allowNull: false,
      },
      sportId: {
        type: DataTypes.UUID, // References Sport table
        allowNull: false,
      },
      experienceYears: DataTypes.INTEGER,
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
