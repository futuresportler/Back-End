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
        // Ensure one-to-one relationship with Supplier
      },
      bio: DataTypes.TEXT,
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hourlyRate: DataTypes.DECIMAL(10, 2),
      minHourlyRate: DataTypes.DECIMAL(10, 2),
      experienceYears: DataTypes.INTEGER,
      // New fields
      sportsCoached: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      maximumLevelPlayed: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ageGroups: {
        type: DataTypes.JSON,
        defaultValue: {
          "0-6": false,
          "6-12": false,
          "12-22": false,
        },
      },
      classType: {
        type: DataTypes.JSON,
        defaultValue: {
          "1-1": false,
          group: false,
        },
      },
      references: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      mediaLinks: {
        type: DataTypes.JSON,
        defaultValue: {
          instagram: "",
          facebook: "",
          twitter: "",
          youtube: "",
          linkedin: "",
        },
      },
      photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      videos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
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
      feedbackPendingNotifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      lastFeedbackReminderSent: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
