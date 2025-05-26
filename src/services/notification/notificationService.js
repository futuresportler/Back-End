const { v4: uuidv4 } = require("uuid");
const notificationRepository = require("./repositories/notificationRepository");
const feedbackReminderRepository = require("./repositories/feedbackReminderRepository");
const { sequelize } = require("../../database");
const realTimeNotificationService = require('./realTimeNotificationService');

const handleServiceError = (operation, error) => {
  console.error(`Notification Service Error in ${operation}:`, error);
  throw new Error(`${operation} failed: ${error.message}`);
};

class NotificationService {

    getModelByType(recipientType) {
    const { User, CoachProfile, AcademyProfile, TurfProfile, AcademyCoach, Supplier } = require("../../database");
    
    switch (recipientType) {
        case 'user':
        case 'student':
        return User;
        case 'coach':
        return CoachProfile;
        case 'academy_coach':
        return AcademyCoach;
        case 'academy':
        return AcademyProfile;
        case 'turf':
        return TurfProfile;
        case 'supplier': 
        return Supplier;
        default:
        throw new Error(`Unknown recipient type: ${recipientType}`);
    }
    }

    getPrimaryKey(recipientType) {
    switch (recipientType) {
        case 'user':
        case 'student':
        return 'userId';
        case 'coach':
        return 'coachId';
        case 'academy_coach':
        return 'id';
        case 'academy':
        return 'academyProfileId';
        case 'turf':
        return 'turfProfileId';
        case 'supplier': 
        return 'supplierId';
        default:
        return 'id';
    }
    }

  // ============ GENERAL NOTIFICATION METHODS ============
  async validateRecipientExists(recipientId, recipientType) {
    try {
        const Model = this.getModelByType(recipientType);
        const primaryKey = this.getPrimaryKey(recipientType);
        
        const recipient = await Model.findByPk(recipientId);
        return !!recipient;
    } catch (error) {
        return false;
    }
    }
  async createNotification(recipientId, recipientType, notificationData) {
    try {
        // Validate recipient exists
        const recipientExists = await this.validateRecipientExists(recipientId, recipientType);
        if (!recipientExists) {
        throw new Error(`Recipient not found: ${recipientType}:${recipientId}`);
        }

        const notification = {
        notificationId: uuidv4(),
        recipientId,
        recipientType,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        priority: notificationData.priority || 'medium',
        isRead: false,
        expiresAt: notificationData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };

        const createdNotification = await notificationRepository.createNotification(notification);
        
        // Trigger real-time notification here (WebSocket/SSE)
        await this.sendRealTimeNotification(recipientId, recipientType, createdNotification);
        
        return createdNotification;
    } catch (error) {
        handleServiceError('createNotification', error);
    }
    }

  async getNotifications(recipientId, recipientType, filters = {}) {
    const result = await notificationRepository.getNotificationsByRecipient(recipientId, recipientType, filters);
    
    return {
      notifications: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(filters.page) || 1,
        limit: parseInt(filters.limit) || 20,
        totalPages: Math.ceil(result.count / (parseInt(filters.limit) || 20))
      }
    };
  }

  async markAsRead(notificationId) {
    return await notificationRepository.markNotificationAsRead(notificationId);
  }

  async markAllAsRead(recipientId, recipientType) {
    return await notificationRepository.markAllAsRead(recipientId, recipientType);
  }

  async deleteNotification(notificationId) {
    return await notificationRepository.deleteNotification(notificationId);
  }

  async getUnreadCount(recipientId, recipientType) {
    return await notificationRepository.getUnreadCount(recipientId, recipientType);
  }

  // ============ FEEDBACK NOTIFICATION METHODS ============

  async generateFeedbackNotificationsForBatch(batchId, options = {}) {
    const { 
      priority = 'medium',
      dueInHours = 24,
      reminderType = 'batch_feedback'
    } = options;

    // Get students needing feedback for this batch
    const students = await notificationRepository.getStudentsNeedingFeedback({ batchId });
    
    // Get coaches assigned to this batch
    const coaches = await notificationRepository.getCoachesForFeedbackGeneration();
    
    const notifications = [];
    const reminders = [];
    
    for (const student of students) {
      for (const coach of coaches) {
        // Create notification for coach
        const notification = {
          notificationId: uuidv4(),
          recipientId: coach.id,
          recipientType: 'academy_coach',
          type: 'feedback_request',
          title: 'Feedback Required',
          message: `Please provide feedback for student ${student.studentName} in batch`,
          data: {
            studentId: student.studentId,
            studentName: student.studentName,
            batchId: batchId,
            type: reminderType
          },
          priority,
          isRead: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
        notifications.push(notification);

        // Create feedback reminder
        const reminder = {
          reminderId: uuidv4(),
          coachId: coach.id,
          studentId: student.studentId,
          batchId: batchId,
          academyId: student.academyId,
          type: reminderType,
          dueDate: new Date(Date.now() + dueInHours * 60 * 60 * 1000),
          status: 'pending',
          priority,
          escalationLevel: 0
        };
        reminders.push(reminder);
      }
    }

    // Bulk create notifications and reminders
    await Promise.all([
      notificationRepository.createBulkNotifications(notifications),
      notificationRepository.createBulkFeedbackReminders(reminders)
    ]);

    return {
      notificationsCreated: notifications.length,
      remindersCreated: reminders.length,
      studentsProcessed: students.length
    };
  }

  async generateFeedbackNotificationsForProgram(programId, options = {}) {
    const { 
      priority = 'medium',
      dueInHours = 48,
      reminderType = 'program_feedback'
    } = options;

    const students = await notificationRepository.getStudentsNeedingFeedback({ programId });
    const coaches = await notificationRepository.getCoachesForFeedbackGeneration();
    
    const notifications = [];
    const reminders = [];
    
    for (const student of students) {
      for (const coach of coaches) {
        const notification = {
          notificationId: uuidv4(),
          recipientId: coach.id,
          recipientType: 'academy_coach',
          type: 'feedback_request',
          title: 'Program Feedback Required',
          message: `Please provide program feedback for student ${student.studentName}`,
          data: {
            studentId: student.studentId,
            studentName: student.studentName,
            programId: programId,
            type: reminderType
          },
          priority,
          isRead: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        notifications.push(notification);

        const reminder = {
          reminderId: uuidv4(),
          coachId: coach.id,
          studentId: student.studentId,
          programId: programId,
          academyId: student.academyId,
          type: reminderType,
          dueDate: new Date(Date.now() + dueInHours * 60 * 60 * 1000),
          status: 'pending',
          priority,
          escalationLevel: 0
        };
        reminders.push(reminder);
      }
    }

    await Promise.all([
      notificationRepository.createBulkNotifications(notifications),
      notificationRepository.createBulkFeedbackReminders(reminders)
    ]);

    return {
      notificationsCreated: notifications.length,
      remindersCreated: reminders.length,
      studentsProcessed: students.length
    };
  }

  async generateBulkFeedbackNotifications(academyId = null, options = {}) {
    const { 
      includeAllStudents = false,
      daysSinceLastFeedback = 7,
      priority = 'medium'
    } = options;

    const students = await notificationRepository.getStudentsNeedingFeedback({
      academyId,
      daysSinceLastFeedback
    });

    const coaches = await notificationRepository.getCoachesForFeedbackGeneration(academyId);
    
    const batchNotifications = [];
    const programNotifications = [];
    
    for (const student of students) {
      for (const coach of coaches) {
        // Batch feedback notifications
        if (student.batchId) {
          batchNotifications.push({
            notificationId: uuidv4(),
            recipientId: coach.id,
            recipientType: 'academy_coach',
            type: 'feedback_request',
            title: 'Batch Feedback Required',
            message: `Please provide batch feedback for ${student.studentName}`,
            data: {
              studentId: student.studentId,
              studentName: student.studentName,
              batchId: student.batchId,
              type: 'batch_feedback'
            },
            priority,
            isRead: false
          });
        }

        // Program feedback notifications
        if (student.programId) {
          programNotifications.push({
            notificationId: uuidv4(),
            recipientId: coach.id,
            recipientType: 'academy_coach',
            type: 'feedback_request',
            title: 'Program Feedback Required',
            message: `Please provide program feedback for ${student.studentName}`,
            data: {
              studentId: student.studentId,
              studentName: student.studentName,
              programId: student.programId,
              type: 'program_feedback'
            },
            priority,
            isRead: false
          });
        }
      }
    }

    const allNotifications = [...batchNotifications, ...programNotifications];
    
    if (allNotifications.length > 0) {
      await notificationRepository.createBulkNotifications(allNotifications);
    }

    return {
      totalNotifications: allNotifications.length,
      batchNotifications: batchNotifications.length,
      programNotifications: programNotifications.length,
      studentsProcessed: students.length,
      coachesNotified: coaches.length
    };
  }

  // ============ BOOKING NOTIFICATION METHODS ============

  async createBookingRequestNotification(slotRequestId, supplierData) {
    const { supplierId, supplierType, requestData } = supplierData;

    // Create booking notification
    const bookingNotification = {
      notificationId: uuidv4(),
      requestId: slotRequestId,
      supplierId,
      supplierType,
      type: 'booking_request',
      status: 'pending',
      message: `New booking request received for ${requestData.slotDate} at ${requestData.slotTime}`,
      requestData: requestData
    };

    await notificationRepository.createBookingNotification(bookingNotification);

    // Create general notification for supplier
    const notification = {
      notificationId: uuidv4(),
      recipientId: supplierId,
      recipientType: supplierType,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${requestData.slotDate}`,
      data: {
        requestId: slotRequestId,
        slotDate: requestData.slotDate,
        slotTime: requestData.slotTime,
        customerName: requestData.customerName
      },
      priority: 'high',
      isRead: false
    };

    await notificationRepository.createNotification(notification);

    return { bookingNotification, notification };
  }

  async getBookingRequests(supplierId, supplierType, filters = {}) {
    return await notificationRepository.getBookingNotifications(supplierId, supplierType, filters);
  }

  async updateBookingRequestStatus(notificationId, status, response = null) {
    const updateData = {
      status,
      respondedAt: new Date()
    };

    if (response) {
      updateData.response = response;
    }

    return await notificationRepository.updateBookingNotification(notificationId, updateData);
  }

  async getPendingBookingRequests(supplierId, supplierType) {
    return await notificationRepository.getPendingBookingRequests(supplierId, supplierType);
  }

  // ============ FEEDBACK REMINDER METHODS ============

  async getFeedbackReminders(filters = {}) {
    return await notificationRepository.getFeedbackReminders(filters);
  }

  async updateFeedbackReminder(reminderId, updateData) {
    return await notificationRepository.updateFeedbackReminder(reminderId, updateData);
  }

  async markFeedbackCompleted(reminderId, feedbackData) {
    return await feedbackReminderRepository.markReminderCompleted(reminderId, feedbackData);
  }

  async processOverdueReminders() {
    const overdueReminders = await notificationRepository.getPendingFeedbackReminders();
    
    const escalatedCount = 0;
    
    for (const reminder of overdueReminders) {
      // Escalate reminder
      await feedbackReminderRepository.escalateReminder(
        reminder.reminderId, 
        reminder.escalationLevel + 1
      );

      // Create escalation notification
      await this.createNotification(
        reminder.coachId,
        'academy_coach',
        {
          type: 'feedback_reminder_escalation',
          title: 'Urgent: Feedback Overdue',
          message: `Feedback for student ${reminder.student?.name} is overdue. Please provide feedback immediately.`,
          data: {
            reminderId: reminder.reminderId,
            studentId: reminder.studentId,
            escalationLevel: reminder.escalationLevel + 1
          },
          priority: 'high'
        }
      );
    }

    return {
      overdueReminders: overdueReminders.length,
      escalatedCount
    };
  }

  // ============ UTILITY METHODS ============

  async sendRealTimeNotification(recipientId, recipientType, notification) {
  try {
    // Send via WebSocket
    const wsSuccess = realTimeNotificationService.sendNotificationToUser(recipientId, notification);
    
    // Log the attempt
    if (wsSuccess) {
      console.log(`Real-time notification sent via WebSocket to ${recipientType}:${recipientId}`);
    } else {
      console.log(`User ${recipientId} not connected via WebSocket, skipping real-time notification`);
      await this.sendPushNotification(recipientId, notification);
    }

    // You can also implement push notifications here for mobile apps
    
    return { websocket: wsSuccess };
  } catch (error) {
    console.error('Error sending real-time notification:', error);
    return { websocket: false, error: error.message };
  }
}

  async cleanupExpiredNotifications() {
    return await notificationRepository.deleteExpiredNotifications();
  }

  async getNotificationStats(recipientId, recipientType, timeframe = 30) {
    return await notificationRepository.getNotificationStats(recipientId, recipientType, timeframe);
  }

  // ============ WHATSAPP INTEGRATION (PLACEHOLDER) ============

  async sendWhatsAppNotification(phoneNumber, message, templateData = {}) {
    // Placeholder for WhatsApp integration
    // Implement based on your WhatsApp Business API setup
    console.log(`WhatsApp notification to ${phoneNumber}: ${message}`);
    
    return {
      success: true,
      messageId: uuidv4(),
      platform: 'whatsapp'
    };
  }

  async sendBulkWhatsAppNotifications(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      try {
        const result = await this.sendWhatsAppNotification(
          notification.phoneNumber,
          notification.message,
          notification.templateData
        );
        results.push({ ...result, recipientId: notification.recipientId });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          recipientId: notification.recipientId
        });
      }
    }
    
    return results;
  }
}

module.exports = new NotificationService();