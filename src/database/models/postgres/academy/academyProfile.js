const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyProfile",
    {
      academyId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sports: {
        type: DataTypes.ARRAY(DataTypes.STRING),
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
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalPrograms: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      description: DataTypes.TEXT,
      city: DataTypes.STRING,
      address: DataTypes.TEXT,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      website: DataTypes.STRING,
      operatingHours: DataTypes.JSON,
      foundedYear: DataTypes.INTEGER,
      facilities: DataTypes.ARRAY(DataTypes.STRING),
      achievements: DataTypes.ARRAY(DataTypes.STRING),
      photos: DataTypes.ARRAY(DataTypes.STRING),
      videos: DataTypes.ARRAY(DataTypes.STRING),
      socialMediaLinks: DataTypes.JSON,
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
