const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  validateRecipientType,
  validateUUID,
  validatePagination,
  validateBookingNotification,
  validateFeedbackGeneration,
  handleValidationErrors
} = require("../validation/notificationValidation");
const { body } = require("express-validator"); 



// Register device token for push notifications
router.post("/device-token/register", 
  authMiddleware, 
  [
    body('deviceToken')
      .notEmpty()
      .withMessage('Device token is required'),
    body('deviceType')
      .isIn(['android', 'ios', 'web'])
      .withMessage('Device type must be android, ios, or web'),
    handleValidationErrors
  ],
  notificationController.registerDeviceToken
);

// Unregister device token
router.post("/device-token/unregister", 
  authMiddleware, 
  [
    body('deviceToken')
      .notEmpty()
      .withMessage('Device token is required'),
    handleValidationErrors
  ],
  notificationController.unregisterDeviceToken
);
// ============ GENERAL NOTIFICATION ROUTES ============

// Get notifications for a recipient
router.get("/:recipientType", 
  authMiddleware, 
  validateRecipientType,
  validatePagination,
  notificationController.getNotifications
);

// Get unread count
router.get("/:recipientType/count", 
  authMiddleware, 
  notificationController.getUnreadCount
);

// Get notification statistics
router.get("/:recipientType/stats", 
  authMiddleware, 
  notificationController.getNotificationStats
);

// Mark notification as read
router.patch("/:notificationId/read", 
  authMiddleware, 
  validateUUID('notificationId'),
  notificationController.markNotificationAsRead
);

// Mark all notifications as read
router.patch("/:recipientType/read-all", 
  authMiddleware, 
  notificationController.markAllAsRead
);

// Delete notification
router.delete("/:notificationId", 
  authMiddleware, 
  notificationController.deleteNotification
);

// ============ FEEDBACK NOTIFICATION ROUTES ============

// Generate feedback notifications
router.post("/feedback/:type/:entityId", 
  authMiddleware, 
  validateFeedbackGeneration,
  notificationController.generateFeedbackNotifications
);

// Get feedback reminders
router.get("/feedback/reminders", 
  authMiddleware, 
  notificationController.getFeedbackReminders
);

// Update feedback reminder
router.patch("/feedback/reminders/:reminderId", 
  authMiddleware, 
  notificationController.updateFeedbackReminder
);

// Mark feedback as completed
router.patch("/feedback/reminders/:reminderId/complete", 
  authMiddleware, 
  notificationController.markFeedbackCompleted
);

// Process overdue reminders
router.post("/feedback/process-overdue", 
  authMiddleware, 
  notificationController.processOverdueReminders
);

// ============ BOOKING NOTIFICATION ROUTES ============

// Create booking notification
router.post("/booking/request", 
  authMiddleware, 
  validateBookingNotification,
  notificationController.createBookingNotification
);

// Get booking requests
router.get("/booking/:supplierType/requests", 
  authMiddleware, 
  notificationController.getBookingRequests
);

// Get pending booking requests
router.get("/booking/:supplierType/pending", 
  authMiddleware, 
  notificationController.getPendingBookingRequests
);

// Update booking request status
router.patch("/booking/requests/:notificationId", 
  authMiddleware, 
  notificationController.updateBookingRequest
);

// ============ WHATSAPP ROUTES ============

// Send WhatsApp notification
router.post("/whatsapp/send", 
  authMiddleware, 
  notificationController.sendWhatsAppNotification
);

// Send bulk WhatsApp notifications
router.post("/whatsapp/bulk", 
  authMiddleware, 
  notificationController.sendBulkWhatsAppNotifications
);

// ============ UTILITY ROUTES ============

// Cleanup expired notifications
router.post("/cleanup/expired", 
  authMiddleware, 
  notificationController.cleanupExpiredNotifications
);

// ============ SCHEDULER ROUTES ============ 

router.post("/scheduler/start", 
  authMiddleware, 
  notificationController.startScheduler
);

router.post("/scheduler/stop", 
  authMiddleware, 
  notificationController.stopScheduler
);

router.get("/scheduler/status", 
  authMiddleware, 
  notificationController.getSchedulerStatus
);

router.post("/scheduler/trigger/:type/:entityId", 
  authMiddleware, 
  notificationController.triggerFeedbackGeneration
);

router.post("/scheduler/one-time", 
  authMiddleware, 
  notificationController.scheduleOneTimeNotification
);


// ============ WEBSOCKET ROUTES ============

// WebSocket status endpoint
router.get("/websocket/status", 
  authMiddleware, 
  notificationController.getWebSocketStatus
);

// Get detailed connection info (admin only)
router.get("/websocket/connections", 
  authMiddleware, 
  notificationController.getConnectionInfo
);

// Test WebSocket connection for current user
router.post("/websocket/test", 
  authMiddleware, 
  notificationController.testWebSocketConnection
);

// Force disconnect user (admin only)
router.post("/websocket/disconnect/:userId", 
  authMiddleware, 
  validateUUID('userId'),
  notificationController.disconnectUser
);

// Broadcast notification to all connected users (admin only)
router.post("/websocket/broadcast", 
  authMiddleware, 
  [
    body('notification')
      .isObject()
      .withMessage('Notification data must be an object'),
    body('notification.title')
      .notEmpty()
      .withMessage('Notification title is required'),
    body('notification.message')
      .notEmpty()
      .withMessage('Notification message is required'),
    handleValidationErrors
  ],
  notificationController.broadcastNotification
);



module.exports = router;