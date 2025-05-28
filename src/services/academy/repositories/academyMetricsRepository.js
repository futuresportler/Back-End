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
            [Op.gt]: new Date(Date.now() - 1 * 60 * 1000) // 1 min ago
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


  async incrementMetricCounter(academyId, monthId, dayId, field, amount = 1){
    try {
      // Update daily metric
      const [dailyMetric, dailyCreated] = await AcademyMetric.findOrCreate({
        where: { academyId, dayId, monthId },
        defaults: {
          academyId,
          dayId,
          monthId,
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          totalRevenue: 0,
          newStudents: 0,
          activeStudents: 0
        }
      });

      dailyMetric[field] = (dailyMetric[field] || 0) + amount;
      await dailyMetric.save();

      return dailyMetric;
    } catch (error) {
      console.error('Error incrementing academy metric counter:', error);
      throw error;
    }
  };

  async incrementBatchMetricCounter(batchId, monthId, field, amount = 1){
    try {
      const batch = await AcademyBatch.findByPk(batchId);
      if (!batch) throw new Error('Batch not found');

      // Check if BatchMonthlyMetric model exists, if not use a generic approach
      let metric;
      try {
        const BatchMonthlyMetric = require('../../../database/models/postgres/academy/batchMonthlyMetric')(sequelize);
        [metric] = await BatchMonthlyMetric.findOrCreate({
          where: { batchId, monthId, academyId: batch.academyId },
          defaults: {
            batchId,
            monthId,
            academyId: batch.academyId,
            totalSessions: 0,
            completedSessions: 0,
            cancelledSessions: 0,
            totalRevenue: 0
          }
        });
      } catch (modelError) {
        // If model doesn't exist, aggregate to academy level
        return await incrementMetricCounter(batch.academyId, monthId, null, field, amount);
      }

      metric[field] = (metric[field] || 0) + amount;
      await metric.save();
      
      return metric;
    } catch (error) {
      console.error('Error incrementing academy batch metric counter:', error);
      throw error;
    }
  };

  async incrementProgramMetricCounter(programId, monthId, field, amount = 1){
    try {
      const program = await AcademyProgram.findByPk(programId);
      if (!program) throw new Error('Program not found');

      // Check if ProgramMonthlyMetric model exists
      let metric;
      try {
        const ProgramMonthlyMetric = require('../../../database/models/postgres/academy/programMonthlyMetric')(sequelize);
        [metric] = await ProgramMonthlyMetric.findOrCreate({
          where: { programId, monthId, academyId: program.academyId },
          defaults: {
            programId,
            monthId,
            academyId: program.academyId,
            totalSessions: 0,
            completedSessions: 0,
            cancelledSessions: 0,
            totalRevenue: 0
          }
        });
      } catch (modelError) {
        // If model doesn't exist, aggregate to academy level
        return await incrementMetricCounter(program.academyId, monthId, null, field, amount);
      }

      metric[field] = (metric[field] || 0) + amount;
      await metric.save();
      
      return metric;
    } catch (error) {
      console.error('Error incrementing academy program metric counter:', error);
      throw error;
    }
  };

  async recalculateMetricsFromSessions(academyId, monthId){
    try {
      // Get all sessions for this academy and month
      const batchSessions = await AcademyBatchSession.findAll({
        include: [{
          model: AcademyBatch,
          where: { academyId }
        }],
        where: { monthId }
      });

      const programSessions = await AcademyProgramSession.findAll({
        include: [{
          model: AcademyProgram,
          where: { academyId }
        }],
        where: { monthId }
      });

      const allSessions = [...batchSessions, ...programSessions];
      
      const metrics = {
        totalSessions: allSessions.length,
        completedSessions: allSessions.filter(s => s.status === 'completed').length,
        cancelledSessions: allSessions.filter(s => s.status === 'cancelled').length
      };

      // Calculate revenue from fees
      const fees = await AcademyFee.findAll({
        where: { academyId, monthId }
      });
      metrics.totalRevenue = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

      // Update daily metrics (aggregate by day)
      const dayGroups = {};
      allSessions.forEach(session => {
        if (!dayGroups[session.dayId]) {
          dayGroups[session.dayId] = {
            totalSessions: 0,
            completedSessions: 0,
            cancelledSessions: 0
          };
        }
        dayGroups[session.dayId].totalSessions++;
        if (session.status === 'completed') dayGroups[session.dayId].completedSessions++;
        if (session.status === 'cancelled') dayGroups[session.dayId].cancelledSessions++;
      });

      // Update each day's metrics
      for (const [dayId, dayMetrics] of Object.entries(dayGroups)) {
        const [metric, created] = await AcademyMetric.findOrCreate({
          where: { academyId, dayId: parseInt(dayId), monthId },
          defaults: { academyId, dayId: parseInt(dayId), monthId, ...dayMetrics }
        });

        if (!created) {
          await metric.update(dayMetrics);
        }
      }

      return metrics;
    } catch (error) {
      console.error('Error recalculating academy metrics from sessions:', error);
      throw error;
    }
  };
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