const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyCoachProgram",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      academyCoachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyCoaches",
          key: "id",
        },
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyPrograms",
          key: "programId",
        },
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      assignedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["academyCoachId", "programId"],
        },
      ],
    }
  );
};
