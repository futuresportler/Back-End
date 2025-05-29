const Joi = require("joi");

const createFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow(''),
  feedbackType: Joi.string().valid('general', 'technical', 'behavior', 'improvement').default('general'),
  isPublic: Joi.boolean().default(true),
  verifiedPurchase: Joi.boolean().default(false),
  feedbackAspects: Joi.object().default({}),
  programAspects: Joi.object().default({}),
  completionStatus: Joi.string().valid('ongoing', 'completed', 'dropped').default('ongoing')
});

const queryParamsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  page: Joi.number().integer().min(1).default(1),
  rating: Joi.number().integer().min(1).max(5),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  studentId: Joi.string().uuid(),
  verified: Joi.boolean(),
  sort: Joi.string().valid('rating', 'date', 'helpful').default('date'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const entityTypeSchema = Joi.object({
  entityType: Joi.string().valid('academy', 'coach', 'student', 'batch', 'program', 'session').required(),
  entityId: Joi.string().uuid().required()
});

const validateCreateFeedback = (req, res, next) => {
  const { error } = createFeedbackSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }
  next();
};

const validateQueryParams = (req, res, next) => {
  const { error } = queryParamsSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }
  next();
};

const validateEntityParams = (req, res, next) => {
  const { error } = entityTypeSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message,
      field: error.details[0].path[0]
    });
  }
  next();
};

module.exports = {
  validateCreateFeedback,
  validateQueryParams,
  validateEntityParams
};