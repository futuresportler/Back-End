const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "BookingNotification",
    {
      bookingNotificationId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "SlotRequests",
          key: "requestId",
        },
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      supplierType: {
        type: DataTypes.ENUM('turf', 'academy', 'coach'),
        allowNull: false,
      },
      notificationType: {
        type: DataTypes.ENUM('new_request', 'reminder', 'escalation', 'auto_reject'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'acknowledged', 'expired'),
        defaultValue: 'pending',
      },
      reminderCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastReminderSent: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalationLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      autoRejectAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    { 
      timestamps: true,
      indexes: [
        { fields: ['requestId'] },
        { fields: ['supplierId'] },
        { fields: ['status'] },
        { fields: ['notificationType'] }
      ]
    }
  )
}