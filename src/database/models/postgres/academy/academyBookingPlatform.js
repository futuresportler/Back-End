const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyBookingPlatform",
    {
      id: {
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
        onDelete: "CASCADE",
      },
      monthId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Months",
          key: "monthId",
        },
      },
      platformName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bookingsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["academyId", "monthId", "platformName"],
          unique: true
        }
      ]
    }
  );
};