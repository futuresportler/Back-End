const { sendOTPEmail } = require("../../config/emailService");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { generateAdminPortalToken } = require("../../config/auth");
const AuditLogRepository = require("./auditLog.repository");
const {
  AcademyProfile,
  TurfProfile,
  CoachProfile,
} = require("../../database/index");

async function requestAdminOTP(email) {
  const allowedEmails = process.env.ADMIN_PORTAL_ALLOWED_EMAILS.split(",");
  if (!allowedEmails.includes(email)) {
    throw new Error("Unauthorized email address");
  }

  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
}

async function verifyAdminOTP(email, otp) {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  return {
    accessToken: generateAdminPortalToken(email),
  };
}

async function getServices(type, page = 1, limit = 10, search = "") {
  const modelMap = {
    academy: AcademyProfile,
    turf: TurfProfile,
    coach: CoachProfile,
  };

  const model = modelMap[type];
  if (!model) throw new Error("Invalid service type");

  const where = {
    supplierId: process.env.ADMIN_SUPPLIER_ID,
    addedByAdmin: true
  };

  if (search) where.name = { [Op.iLike]: `%${search}%` };

  const { count, rows } = await model.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
}

async function deleteService(serviceId, serviceType, reason, workerEmail) {
  const modelMap = {
    academy: AcademyProfile,
    turf: TurfProfile,
    coach: CoachProfile,
  };

  const service = await modelMap[serviceType].findOne({
    where: {
      [modelMap[serviceType].primaryKeyAttribute]: serviceId,
      supplierId: process.env.ADMIN_SUPPLIER_ID,
    },
  });

  if (!service) throw new Error("Service not found");

  await service.destroy();

  await AuditLogRepository.createLog({
    workerEmail,
    serviceType,
    serviceId,
    reason,
  });
}

async function getAuditLogs(serviceType, page = 1, limit = 100) {
  const where = serviceType ? { serviceType } : {};

  return await AuditLogRepository.getLogs({
    where,
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });
}

module.exports = {
  requestAdminOTP,
  verifyAdminOTP,
  getServices,
  deleteService,
  getAuditLogs,
};
