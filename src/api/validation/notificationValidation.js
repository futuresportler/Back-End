const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../../common/utils/response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', errors.array(), 400);
  }
  next();
};

const validateNotificationCreation = [
  body('type')
    .isIn(['feedback_request', 'booking_request', 'booking_confirmation', 'booking_rejection', 'payment_reminder', 'review_request', 'general'])
    .withMessage('Invalid notification type'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

const validateRecipientType = [
  param('recipientType')
    .isIn(['user', 'coach', 'academy', 'turf'])
    .withMessage('Invalid recipient type'),
  handleValidationErrors
];

const validateUUID = (field) => [
  param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateBookingNotification = [
  body('slotRequestId')
    .isUUID()
    .withMessage('Slot request ID must be a valid UUID'),
  body('supplierData.supplierId')
    .isUUID()
    .withMessage('Supplier ID must be a valid UUID'),
  body('supplierData.supplierType')
    .isIn(['turf', 'academy', 'coach'])
    .withMessage('Invalid supplier type'),
  handleValidationErrors
];

const validateFeedbackGeneration = [
  param('type')
    .isIn(['batch', 'program', 'academy'])
    .withMessage('Invalid feedback generation type'),
  param('entityId')
    .isUUID()
    .withMessage('Entity ID must be a valid UUID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('dueInHours')
    .optional()
    .isInt({ min: 1, max: 720 })
    .withMessage('Due hours must be between 1 and 720 (30 days)'),
  handleValidationErrors
];

module.exports = {
  validateNotificationCreation,
  validateRecipientType,
  validateUUID,
  validatePagination,
  validateBookingNotification,
  validateFeedbackGeneration,
  handleValidationErrors
};