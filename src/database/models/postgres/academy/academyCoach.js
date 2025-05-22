const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyCoach",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'AcademyProfiles',
          key: 'academyId'
        }
      },
      // Add coachId explicitly
      platformCoachId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'CoachProfiles',
          key: 'coachId'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      experienceLevel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sport: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      certifications: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      joiningDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending'),
        defaultValue: 'pending'
      },
      schedule: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      hourlyRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    { timestamps: true,
      indexes: [
        {
          fields: ['academyId']
        },
        {
          fields: ['platformCoachId']
        },
        {
          fields: ['mobileNumber']
        }
      ] }
  );
};