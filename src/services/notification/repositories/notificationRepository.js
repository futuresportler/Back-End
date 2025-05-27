const { 
  Notification,
  FeedbackReminder,
  BookingNotification,
  User,
  CoachProfile,
  AcademyProfile,
  TurfProfile,
  AcademyCoach,
  AcademyStudent,
  CoachStudent,
  AcademyBatch,
  AcademyProgram,
  SlotRequest,
  sequelize 
} = require("../../../database");
const { Op } = require("sequelize");

class NotificationRepository {
  
  // ============ GENERAL NOTIFICATION METHODS ============
  
  async createNotification(notificationData) {
    return await Notification.create(notificationData);
  }

  async getNotificationsByRecipient(recipientId, recipientType, filters = {}) {
    const where = { recipientId, recipientType };
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }
    
    if (filters.type) {
      where.type = filters.type;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }

    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    return await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  }

  async markNotificationAsRead(notificationId) {
    return await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { notificationId } }
    );
  }

  async markAllAsRead(recipientId, recipientType) {
    return await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { recipientId, recipientType, isRead: false } }
    );
  }

  async deleteNotification(notificationId) {
    return await Notification.destroy({ where: { notificationId } });
  }

  async getUnreadCount(recipientId, recipientType) {
    return await Notification.count({
      where: { recipientId, recipientType, isRead: false }
    });
  }

  async deleteExpiredNotifications() {
    return await Notification.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
  }

  // ============ FEEDBACK REMINDER METHODS ============

  async createFeedbackReminder(reminderData) {
    return await FeedbackReminder.create(reminderData);
  }

  async getFeedbackReminders(filters = {}) {
    const where = {};
    
    if (filters.coachId) where.coachId = filters.coachId;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.batchId) where.batchId = filters.batchId;
    if (filters.programId) where.programId = filters.programId;
    if (filters.academyId) where.academyId = filters.academyId;
    if (filters.status) where.status = filters.status;

    return await FeedbackReminder.findAll({
      where,
      include: [
        { model: CoachProfile, as: "coach", required: false },
        { model: AcademyCoach, as: "academyCoach", required: false },
        { model: User, as: "student", required: false },
        { model: AcademyBatch, as: "batch", required: false },
        { model: AcademyProgram, as: "program", required: false },
        { model: AcademyProfile, as: "academy", required: false }
      ],
      order: [['dueDate', 'ASC']]
    });
  }

  async updateFeedbackReminder(reminderId, updateData) {
    return await FeedbackReminder.update(updateData, {
      where: { reminderId }
    });
  }

  async getPendingFeedbackReminders() {
    return await FeedbackReminder.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.lte]: new Date()
        }
      },
      include: [
        { model: CoachProfile, as: "coach", required: false },
        { model: AcademyCoach, as: "academyCoach", required: false },
        { model: User, as: "student", required: false },
        { model: AcademyBatch, as: "batch", required: false },
        { model: AcademyProgram, as: "program", required: false }
      ]
    });
  }

  // ============ BOOKING NOTIFICATION METHODS ============

  async createBookingNotification(notificationData) {
    return await BookingNotification.create(notificationData);
  }

    async getBookingNotifications(supplierId, supplierType, filters = {}) {
    const { page = 1, limit = 20, status } = filters;
    const offset = (page - 1) * limit;
    
    let whereClause = { supplierId, supplierType };
    if (status) whereClause.status = status;
    
    return await BookingNotification.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });
    }


  async updateBookingNotification(notificationId, updateData) {
    return await BookingNotification.update(updateData, {
        where: { notificationId },
        returning: true
    });
    }

  async getPendingBookingRequests(supplierId, supplierType) {
    return await BookingNotification.findAll({
        where: { 
        supplierId, 
        supplierType, 
        status: 'pending' 
        },
        order: [['createdAt', 'DESC']]
    });
    }

  // ============ ANALYTICS METHODS ============

  async getNotificationStats(recipientId, recipientType, timeframe) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    
    const stats = await Notification.findAll({
        where: {
        recipientId,
        recipientType,
        createdAt: { [Op.gte]: startDate }
        },
        attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('notificationId')), 'count'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isRead" = true THEN 1 END')), 'readCount']
        ],
        group: ['type']
    });
    
    return stats;
    }

  // ============ BULK OPERATIONS ============

  async createBulkNotifications(notifications) {
    const transaction = await sequelize.transaction();
    
    try {
        const createdNotifications = await Notification.bulkCreate(notifications, {
        transaction,
        returning: true
        });
        
        await transaction.commit();
        return createdNotifications;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
    }


  
    async createBulkFeedbackReminders(reminders) {
    const transaction = await sequelize.transaction();
    
    try {
        const createdReminders = await FeedbackReminder.bulkCreate(reminders, {
        transaction,
        returning: true
        });
        
        await transaction.commit();
        return createdReminders;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
    }


  // ============ HELPER METHODS FOR FEEDBACK GENERATION ============

  async getStudentsNeedingFeedback(filters = {}) {
    const { batchId, programId, academyId, daysSinceLastFeedback } = filters;
    
    let whereClause = {};
    
    if (batchId) whereClause.batchId = batchId;
    if (programId) whereClause.programId = programId;
    if (academyId) whereClause.academyId = academyId;
    
     return await AcademyStudent.findAll({
      where: whereClause,
      include: [
      { 
        model: User, 
        as: 'user', 
        attributes: ['userId', 'first_name', 'last_name', 'email', 'mobile'] 
      }
      ],
      attributes: [
        'studentId', 
        'academyId', 
        'batchId', 
        'programId', 
        'name', 
        'userId'
      ]
  });
    }


    
    async getCoachesForFeedbackGeneration(academyId = null) {
    let whereClause = {};
    
    if (academyId) {
        whereClause.academyId = academyId;
    }
    
    return await AcademyCoach.findAll({
        where: whereClause,
        include: [
        { model: CoachProfile, as: 'platformCoach', attributes: ['coachId', 'name'] }
        ]
    });
    }

}

module.exports = new NotificationRepository();