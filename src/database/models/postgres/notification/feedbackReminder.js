const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "FeedbackReminder",
    {
      reminderId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      batchId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      programId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      academyId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      reminderType: {
        type: DataTypes.ENUM('weekly', 'monthly', 'session_based', 'custom'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'completed', 'expired'),
        defaultValue: 'pending',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      remindersSent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastReminderSent: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      feedbackSubmitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      feedbackSubmittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    { 
      timestamps: true,
      indexes: [
        { fields: ['coachId'] },
        { fields: ['studentId'] },
        { fields: ['status'] },
        { fields: ['dueDate'] }
      ]
    }
  )
}