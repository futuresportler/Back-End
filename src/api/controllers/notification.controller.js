const notificationService = require("../../services/notification");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { Notification } = require("../../database");
const realTimeNotificationService = require("../../services/notification/realTimeNotificationService");
const schedulerService = require("../../services/notification/schedulerService");

// ============ HELPER FUNCTIONS ============

const isAuthorizedForRecipientType = (user, recipientType) => {
  switch (recipientType) {
    case 'user':
      return user.role === 'user' || user.role === 'student';
    case 'coach':
      return user.role === 'coach' || user.role === 'individual_coach';
    case 'academy':
      return user.role === 'academy' || user.role === 'academy_admin';
    case 'turf':
      return user.role === 'turf' || user.role === 'turf_admin';
    default:
      return false;
  }
};

const getRecipientIdBasedOnType = (user, recipientType) => {
  switch (recipientType) {
    case 'user':
      return user.userId;
    case 'coach':
      return user.coachId || user.supplierId;
    case 'academy':
      return user.academyId || user.supplierId;
    case 'turf':
      return user.turfId || user.supplierId;
    default:
      return null;
  }
};

const validateNotificationOwnership = async (notificationId, userId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return { valid: false, message: "Notification not found" };
    }
    
    // Check if the user owns this notification
    if (notification.recipientId !== userId) {
      return { valid: false, message: "Unauthorized access to this notification" };
    }
    
    return { valid: true, notification };
  } catch (error) {
    return { valid: false, message: "Error validating notification ownership" };
  }
};

// ============ GENERAL NOTIFICATION CONTROLLERS ============

const getNotifications = async (req, res) => {
  try {
    const { recipientType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, recipientType)) {
      return errorResponse(res, "Unauthorized access to this resource", null, 403);
    }
    
    const recipientId = getRecipientIdBasedOnType(req.user, recipientType);
    if (!recipientId) {
      return errorResponse(res, "Invalid recipient type for user", null, 400);
    }
    
    const notifications = await notificationService.getNotifications(
      recipientId,
      recipientType,
      req.query
    );
    
    successResponse(res, "Notifications fetched successfully", notifications);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId || req.user.supplierId;
    
    // Validate ownership
    const validation = await validateNotificationOwnership(notificationId, userId);
    if (!validation.valid) {
      return errorResponse(res, validation.message, null, validation.message.includes("not found") ? 404 : 403);
    }
    
    await notificationService.markAsRead(notificationId);
    
    successResponse(res, "Notification marked as read", null);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { recipientType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, recipientType)) {
      return errorResponse(res, "Unauthorized access to this resource", null, 403);
    }
    
    const recipientId = getRecipientIdBasedOnType(req.user, recipientType);
    if (!recipientId) {
      return errorResponse(res, "Invalid recipient type for user", null, 400);
    }
    
    await notificationService.markAllAsRead(recipientId, recipientType);
    
    successResponse(res, "All notifications marked as read", null);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId || req.user.supplierId;
    
    // Validate ownership
    const validation = await validateNotificationOwnership(notificationId, userId);
    if (!validation.valid) {
      return errorResponse(res, validation.message, null, validation.message.includes("not found") ? 404 : 403);
    }
    
    await notificationService.deleteNotification(notificationId);
    
    successResponse(res, "Notification deleted successfully", null, 204);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const { recipientType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, recipientType)) {
      return errorResponse(res, "Unauthorized access to this resource", null, 403);
    }
    
    const recipientId = getRecipientIdBasedOnType(req.user, recipientType);
    if (!recipientId) {
      return errorResponse(res, "Invalid recipient type for user", null, 400);
    }
    
    const count = await notificationService.getUnreadCount(recipientId, recipientType);
    
    successResponse(res, "Unread count fetched successfully", { unreadCount: count });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getNotificationStats = async (req, res) => {
  try {
    const { recipientType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, recipientType)) {
      return errorResponse(res, "Unauthorized access to this resource", null, 403);
    }
    
    const recipientId = getRecipientIdBasedOnType(req.user, recipientType);
    if (!recipientId) {
      return errorResponse(res, "Invalid recipient type for user", null, 400);
    }
    
    const { timeframe = 30 } = req.query;
    
    const stats = await notificationService.getNotificationStats(
      recipientId,
      recipientType,
      parseInt(timeframe)
    );
    
    successResponse(res, "Notification statistics fetched successfully", stats);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ FEEDBACK NOTIFICATION CONTROLLERS ============

const generateFeedbackNotifications = async (req, res) => {
  try {
    const { type, entityId } = req.params;
    const options = req.body;
    
    // Authorization check - only academy admins and coaches can generate notifications
    if (!['academy', 'academy_admin', 'coach'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to generate feedback notifications", null, 403);
    }
    
    let result;
    
    switch (type) {
      case 'batch':
        result = await notificationService.generateFeedbackNotificationsForBatch(entityId, options);
        break;
      case 'program':
        result = await notificationService.generateFeedbackNotificationsForProgram(entityId, options);
        break;
      case 'academy':
        result = await notificationService.generateBulkFeedbackNotifications(entityId, options);
        break;
      default:
        return errorResponse(res, "Invalid notification type. Use 'batch', 'program', or 'academy'", null, 400);
    }
    
    successResponse(res, `Feedback notifications generated for ${type}`, result, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getFeedbackReminders = async (req, res) => {
  try {
    // Add user-specific filters
    const filters = { ...req.query };
    
    // If user is a coach, only show their reminders
    if (req.user.role === 'coach') {
      filters.coachId = req.user.coachId || req.user.supplierId;
    }
    
    const reminders = await notificationService.getFeedbackReminders(filters);
    
    successResponse(res, "Feedback reminders fetched successfully", reminders);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateFeedbackReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    
    // Only allow coaches and academy admins to update reminders
    if (!['coach', 'academy', 'academy_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to update feedback reminders", null, 403);
    }
    
    const updated = await notificationService.updateFeedbackReminder(reminderId, req.body);
    
    successResponse(res, "Feedback reminder updated successfully", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const markFeedbackCompleted = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { feedbackData } = req.body;
    
    // Only allow coaches to mark feedback as completed
    if (!['coach', 'academy_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to complete feedback", null, 403);
    }
    
    await notificationService.markFeedbackCompleted(reminderId, feedbackData);
    
    successResponse(res, "Feedback marked as completed", null);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const processOverdueReminders = async (req, res) => {
  try {
    // Only allow admin users to process overdue reminders
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to process overdue reminders", null, 403);
    }
    
    const result = await notificationService.processOverdueReminders();
    
    successResponse(res, "Overdue reminders processed successfully", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ BOOKING NOTIFICATION CONTROLLERS ============

const createBookingNotification = async (req, res) => {
  try {
    const { slotRequestId, supplierData } = req.body;
    
    // Only allow users to create booking notifications for their own requests
    if (req.user.role !== 'user' && req.user.role !== 'student') {
      return errorResponse(res, "Only users can create booking requests", null, 403);
    }
    
    const result = await notificationService.createBookingRequestNotification(
      slotRequestId,
      supplierData
    );
    
    successResponse(res, "Booking notification created successfully", result, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getBookingRequests = async (req, res) => {
  try {
    const { supplierType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, supplierType)) {
      return errorResponse(res, "Unauthorized to view booking requests for this supplier type", null, 403);
    }
    
    const supplierId = req.user.supplierId;
    if (!supplierId) {
      return errorResponse(res, "Supplier ID not found for user", null, 400);
    }
    
    const requests = await notificationService.getBookingRequests(
      supplierId,
      supplierType,
      req.query
    );
    
    successResponse(res, "Booking requests fetched successfully", requests);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const updateBookingRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { status, response } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return errorResponse(res, "Invalid status. Use 'approved', 'rejected', or 'pending'", null, 400);
    }
    
    // Only suppliers can update booking requests
    if (!['turf', 'academy', 'coach'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to update booking requests", null, 403);
    }
    
    const updated = await notificationService.updateBookingRequestStatus(
      notificationId,
      status,
      response
    );
    
    successResponse(res, "Booking request updated successfully", updated);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getPendingBookingRequests = async (req, res) => {
  try {
    const { supplierType } = req.params;
    
    // Authorization check
    if (!isAuthorizedForRecipientType(req.user, supplierType)) {
      return errorResponse(res, "Unauthorized to view pending requests for this supplier type", null, 403);
    }
    
    const supplierId = req.user.supplierId;
    if (!supplierId) {
      return errorResponse(res, "Supplier ID not found for user", null, 400);
    }
    
    const pendingRequests = await notificationService.getPendingBookingRequests(
      supplierId,
      supplierType
    );
    
    successResponse(res, "Pending booking requests fetched successfully", pendingRequests);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ WHATSAPP CONTROLLERS ============

const sendWhatsAppNotification = async (req, res) => {
  try {
    const { phoneNumber, message, templateData } = req.body;
    
    if (!phoneNumber || !message) {
      return errorResponse(res, "Phone number and message are required", null, 400);
    }
    
    // Only allow admin users to send WhatsApp notifications
    if (!['admin', 'super_admin', 'academy_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to send WhatsApp notifications", null, 403);
    }
    
    const result = await notificationService.sendWhatsAppNotification(
      phoneNumber,
      message,
      templateData
    );
    
    successResponse(res, "WhatsApp notification sent successfully", result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const sendBulkWhatsAppNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return errorResponse(res, "Notifications array is required", null, 400);
    }
    
    // Only allow admin users to send bulk WhatsApp notifications
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to send bulk WhatsApp notifications", null, 403);
    }
    
    const results = await notificationService.sendBulkWhatsAppNotifications(notifications);
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
    
    successResponse(res, "Bulk WhatsApp notifications processed", summary);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ UTILITY CONTROLLERS ============

const cleanupExpiredNotifications = async (req, res) => {
  try {
    // Only allow admin users to cleanup notifications
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to cleanup notifications", null, 403);
    }
    
    const deletedCount = await notificationService.cleanupExpiredNotifications();
    
    successResponse(res, "Expired notifications cleaned up successfully", {
      deletedCount
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ SCHEDULER CONTROLLERS ============

const startScheduler = async (req, res) => {
  try {
    // Only allow admin users to start scheduler
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to start scheduler", null, 403);
    }
    
    schedulerService.startScheduler();
    
    successResponse(res, "Notification scheduler started successfully", {
      status: "running"
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const stopScheduler = async (req, res) => {
  try {
    // Only allow admin users to stop scheduler
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to stop scheduler", null, 403);
    }
    
    schedulerService.stopScheduler();
    
    successResponse(res, "Notification scheduler stopped successfully", {
      status: "stopped"
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSchedulerStatus = async (req, res) => {
  try {
    const status = schedulerService.getSchedulerStatus();
    
    successResponse(res, "Scheduler status fetched successfully", status);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const triggerFeedbackGeneration = async (req, res) => {
  try {
    const { type, entityId } = req.params;
    const options = req.body;
    
    // Only allow admin users to trigger feedback generation
    if (!['admin', 'super_admin', 'academy_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to trigger feedback generation", null, 403);
    }
    
    const result = await schedulerService.triggerFeedbackGeneration(type, entityId, options);
    
    successResponse(res, `Feedback generation triggered for ${type}`, result);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const scheduleOneTimeNotification = async (req, res) => {
  try {
    const { date, recipientId, recipientType, notificationData } = req.body;
    
    if (!date || !recipientId || !recipientType || !notificationData) {
      return errorResponse(res, "Missing required fields: date, recipientId, recipientType, notificationData", null, 400);
    }
    
    // Only allow admin users to schedule notifications
    if (!['admin', 'super_admin', 'academy_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to schedule notifications", null, 403);
    }
    
    const jobName = schedulerService.scheduleOneTimeNotification(
      date,
      recipientId,
      recipientType,
      notificationData
    );
    
    successResponse(res, "One-time notification scheduled successfully", {
      jobName,
      scheduledDate: date
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

// ============ WEBSOCKET CONTROLLERS ============

const getWebSocketStatus = async (req, res) => {
  try {
    const status = {
      connectedUsers: realTimeNotificationService.getConnectedUsersCount(),
      userConnected: realTimeNotificationService.isUserConnected(req.user.userId || req.user.supplierId),
      timestamp: new Date().toISOString()
    };
    
    successResponse(res, "WebSocket status retrieved successfully", status);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const disconnectUser = async (req, res) => {
  try {
    // Only allow admin users
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to disconnect users", null, 403);
    }

    const { userId } = req.params;
    const success = realTimeNotificationService.disconnectUser(userId);
    
    successResponse(res, success ? "User disconnected successfully" : "User not connected", { 
      userId, 
      disconnected: success 
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const broadcastNotification = async (req, res) => {
  try {
    // Only allow admin users
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to broadcast notifications", null, 403);
    }

    const { notification } = req.body;
    if (!notification) {
      return errorResponse(res, "Notification data is required", null, 400);
    }

    const results = realTimeNotificationService.broadcastToAll(notification);
    
    successResponse(res, "Broadcast notification sent", {
      totalConnected: results.totalConnected,
      successfulSends: results.successful,
      failedSends: results.failed
    });
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getConnectionInfo = async (req, res) => {
  try {
    // Only allow admin users
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return errorResponse(res, "Unauthorized to view connection info", null, 403);
    }

    const connectionInfo = realTimeNotificationService.getConnectionInfo();
    
    successResponse(res, "Connection info retrieved successfully", connectionInfo);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const testWebSocketConnection = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.supplierId;
    const isConnected = realTimeNotificationService.isUserConnected(userId);
    
    if (isConnected) {
      // Send a test notification to the user
      const testNotification = {
        notificationId: 'test-' + Date.now(),
        title: 'WebSocket Test',
        message: 'This is a test notification to verify WebSocket connection',
        type: 'general',
        priority: 'low',
        createdAt: new Date().toISOString()
      };
      
      const sent = realTimeNotificationService.sendNotificationToUser(userId, testNotification);
      
      successResponse(res, "Test notification sent via WebSocket", {
        connected: true,
        testSent: sent,
        userId
      });
    } else {
      successResponse(res, "User not connected via WebSocket", {
        connected: false,
        userId,
        message: "Please establish WebSocket connection first"
      });
    }
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};


module.exports = {
  // General notification methods
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationStats,

  // Feedback notification methods
  generateFeedbackNotifications,
  getFeedbackReminders,
  updateFeedbackReminder,
  markFeedbackCompleted,
  processOverdueReminders,

  // Booking notification methods
  createBookingNotification,
  getBookingRequests,
  updateBookingRequest,
  getPendingBookingRequests,

  // WhatsApp methods
  sendWhatsAppNotification,
  sendBulkWhatsAppNotifications,

  // Utility methods
  cleanupExpiredNotifications,

  // Scheduler methods
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  triggerFeedbackGeneration,
  scheduleOneTimeNotification,
  
  //websocket methods
  getWebSocketStatus,
  disconnectUser,
  broadcastNotification,
  getConnectionInfo,
  testWebSocketConnection,
};