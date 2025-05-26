const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "Notification",
    {
      notificationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      recipientId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
          isUUID: 4
        }
      },
      recipientType: {
        type: DataTypes.ENUM('user', 'coach', 'academy', 'turf','student','supplier','academy_coach'),
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [['user', 'coach', 'academy', 'turf','student','supplier','academy_coach']]
        }
      },
      type: {
        type: DataTypes.ENUM(
          'feedback_reminder', 
          'booking_request', 
          'booking_confirmation',
          'booking_rejection',
          'payment_reminder',
          'review_request',
          'general',
          'academy_manager_invitation'
        ),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255]
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 1000]
        }
      },
      data: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        validate: {
          isIn: [['low', 'medium', 'high', 'urgent']]
        }
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actionUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    { 
      timestamps: true,
      indexes: [
        { fields: ['recipientId', 'recipientType'] },
        { fields: ['type'] },
        { fields: ['isRead'] },
        { fields: ['createdAt'] },
        { fields: ['priority'] },
        { fields: ['recipientId', 'isRead', 'createdAt'] }, // Compound index for queries
        { fields: ['expiresAt'] }, // For cleanup queries
        { fields: ['recipientId', 'type', 'isRead'] } // For filtered queries

      ]
    }
  )
}