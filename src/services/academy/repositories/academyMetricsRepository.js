const { 
  AcademyMetric, 
  AcademyProfileView, 
  AcademyInquiry,
  Month,
  sequelize 
} = require("../../../database");
const { Op } = require("sequelize");

class AcademyMetricsRepository {
  // Profile views
  async recordProfileView(viewData) {
    // Check if this user/IP has viewed this academy recently (e.g., in the last hour)
    const recentView = await AcademyProfileView.findOne({
        where: {
        academyId: viewData.academyId,
        ...(viewData.userId ? { userId: viewData.userId } : { ipAddress: viewData.ipAddress }),
        createdAt: {
            [Op.gt]: new Date(Date.now() - 10 * 60 * 1000) // 10 min ago
        }
        }
    });
    
    // If this is a repeat view from the same source, don't record it again
    if (recentView) {
        return recentView;
    }
    
    return await AcademyProfileView.create(viewData);
    }

  async getProfileViews(academyId, { startDate, endDate } = {}) {
    const where = { academyId };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    return await AcademyProfileView.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });
  }

  async countProfileViews(academyId, { startDate, endDate } = {}) {
    const where = { academyId };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    return await AcademyProfileView.count({ where });
  }

  // Inquiries
  async createInquiry(inquiryData) {
    return await AcademyInquiry.create(inquiryData);
  }

  async getInquiries(academyId, { status, startDate, endDate } = {}) {
    const where = { academyId };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    return await AcademyInquiry.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });
  }

  async countInquiries(academyId, { status, startDate, endDate } = {}) {
    const where = { academyId };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    return await AcademyInquiry.count({ where });
  }

  // Metrics
  async getOrCreateMonthlyMetric(academyId, monthId) {
    const [metric, created] = await AcademyMetric.findOrCreate({
      where: { academyId, monthId },
      defaults: {
        // Default values are set in the model
      }
    });
    
    return metric;
  }

  async updateMonthlyMetric(academyId, monthId, updateData) {
    const metric = await this.getOrCreateMonthlyMetric(academyId, monthId);
    return await metric.update(updateData);
  }

  async getMonthlyMetrics(academyId, { year, limit } = {}) {
    const include = [{
      model: Month,
      as: "month",
      attributes: ["monthId", "monthName", "yearId"],
      required: true
    }];
    
    if (year) {
      include[0].where = { year };
    }
    
    const options = {
      where: { academyId },
      include,
      order: [[include[0].as, "monthNumber", "DESC"]]
    };
    
    if (limit) {
      options.limit = parseInt(limit, 10);
    }
    
    return await AcademyMetric.findAll(options);
  }

  async calculateConversionRate(academyId, monthId) {
    // Get the month dates
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    // Get first and last day of month
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Count inquiries and enrollments for this period
    const inquiries = await this.countInquiries(academyId, { 
      startDate, 
      endDate 
    });
    
    const conversions = await AcademyInquiry.count({
      where: {
        academyId,
        createdAt: { [Op.between]: [startDate, endDate] },
        convertedToStudent: true
      }
    });
    
    // Calculate rate (avoid division by zero)
    const rate = inquiries > 0 ? (conversions / inquiries) * 100 : 0;
    
    // Update the metric
    await this.updateMonthlyMetric(academyId, monthId, {
      inquiries,
      newEnrollments: conversions,
      conversionRate: parseFloat(rate.toFixed(2))
    });
    
    return {
      inquiries,
      conversions,
      rate: parseFloat(rate.toFixed(2))
    };
  }
}

module.exports = new AcademyMetricsRepository();