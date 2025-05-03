const { AuditLog } = require("../../database/index");

class AuditLogRepository {
  static async createLog(logData) {
    return await AuditLog.create(logData);
  }

  static async getLogs({ serviceType, page = 1, limit = 100 }) {
    const where = serviceType ? { serviceType } : {};

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
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
}

module.exports = AuditLogRepository;