const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "UserDeviceToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'User',
          key: 'userId'
        }
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Suppliers',
          key: 'supplierId'
        }
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'CoachProfiles',
          key: 'coachId'
        }
      },
      deviceToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      deviceType: {
        type: DataTypes.ENUM('android', 'ios', 'web'),
        allowNull: false
      },
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['supplierId'] },
        { fields: ['coachId'] },
        { fields: ['deviceToken'] },
        { fields: ['isActive'] }
      ],
      validate: {
        // Ensure only one foreign key is set
        onlyOneUserType() {
          const userFields = [this.userId, this.supplierId, this.coachId].filter(Boolean);
          if (userFields.length !== 1) {
            throw new Error('Exactly one of userId, supplierId, or coachId must be set');
          }
        }
      }
    }
  );
};