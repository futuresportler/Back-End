const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyProfile",
    {
      // Primary Key
      academyId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      // Basic Info
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      foundedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Related to Supplier
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "supplierId",
        },
        onDelete: "CASCADE",
      },
      managerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Suppliers",
          key: "supplierId",
        },
      },
      // Sports & Facilities
      sports: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      facilities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      achievements: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },

      // Age Groups & Class Types
      ageGroups: {
        type: DataTypes.JSON,
        allowNull: false,
        // Example: [{ "infants": true, "children": false, teens: true, adults: false }]
      },
      classTypes: {
        type: DataTypes.JSON,
        allowNull: false,
        // Example: [{ "one-on-one": false, "group-classes": true}]
      },

      // Location Info
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // Contact Info
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      socialMediaLinks: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      // Media
      photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      videos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },

      // Operational Details
      operatingHours: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      totalPrograms: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },

      // Ratings & Reviews
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
        allowNull: false,
      },
      reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },

      // Verification
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      addedByAdmin: {
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
