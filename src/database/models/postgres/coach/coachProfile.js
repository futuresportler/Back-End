// models/postgres/coachProfile.js (Main Coach Table)
const { DataTypes } = require("sequelize")

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
        unique: true, // Ensure one-to-one relationship with Supplier
      },
      bio: DataTypes.TEXT,
      hourlyRate: DataTypes.DECIMAL(10, 2),
      sportId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experienceYears: DataTypes.INTEGER,
      qualifications: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      certifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      achievements: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        defaultValue: "active",
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  )
}
