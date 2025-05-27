const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize) => {
  return sequelize.define(
    "AcademyInvitation",
    {
      invitationId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4()
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "AcademyProfiles",
          key: "academyId"
        }
      },
      inviterSupplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "supplierId"
        }
      },
      inviteeSupplierId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Suppliers",
          key: "supplierId"
        }
      },
      inviteePhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      inviteeEmail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('manager', 'coach'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'),
        defaultValue: 'pending'
      },
      invitationToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      timestamps: true,
      indexes: [
        { fields: ["academyId"] },
        { fields: ["inviteeSupplierId"] },
        { fields: ["inviteePhoneNumber"] },
        { fields: ["status"] },
        { fields: ["invitationToken"] }
      ]
    }
  );
};