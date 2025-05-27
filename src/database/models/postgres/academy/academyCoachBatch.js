const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyCoachBatch",
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
          model: "AcademyCoach",
          key: "id",
        },
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyBatches",
          key: "batchId",
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
          fields: ["academyCoachId", "batchId"],
        },
      ],
    }
  );
};
