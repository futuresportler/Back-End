const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyInquiry",
    {
      inquiryId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyProfiles",
          key: "academyId",
        },
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AcademyPrograms",
          key: "programId",
        },
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      message: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM("new", "contacted", "enrolled", "not-interested"),
        defaultValue: "new",
      },
      source: DataTypes.STRING,
      convertedToStudent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      convertedStudentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AcademyStudents",
          key: "studentId",
        },
      },
    },
    { 
      timestamps: true,
      indexes: [
        {
          fields: ["academyId"]
        },
        {
          fields: ["status"]
        },
        {
          fields: ["createdAt"]
        }
      ]
    }
  );
};