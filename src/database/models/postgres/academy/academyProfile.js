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
        allowNull: false,
      },
      foundedYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        allowNull: false,
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
        allowNull: true,
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
        allowNull: true,
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
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: true,
      },
      totalPrograms: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },

      // Ratings & Reviews
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
        allowNull: true,
      },
      reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },

      trailDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // Example: 7 (for 7 days)
      },
      trailBookable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,  
        allowNull: false,
      },
      cctv: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      // Verification
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      },
      managerInvitationStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: true
      },
      managerInvitedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      managerAcceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
