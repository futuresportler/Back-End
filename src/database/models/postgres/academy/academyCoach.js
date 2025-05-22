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
          key: 'id'
        }
      },
      // Add coachId explicitly
      coachId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'CoachProfiles',
          key: 'id' // Assuming this is the primary key in CoachProfiles
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
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
    },
    { timestamps: false }
  );
};