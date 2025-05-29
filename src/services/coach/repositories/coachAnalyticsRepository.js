// src/services/coach/repositories/coachAnalyticsRepository.js
const {
  CoachProfile,
  CoachBatch,
  CoachPayment,
  CoachStudent,
  CoachReview,
  CoachSession,
  MonthlyCoachMetric,
  BatchMonthlyMetric,
  MonthlyStudentProgress,
  Month,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

class CoachAnalyticsRepository {
  // Coach monthly metrics
  async getOrCreateMonthlyMetric(coachId, monthId) {
    const [metric, created] = await MonthlyCoachMetric.findOrCreate({
      where: { coachId, monthId },
      defaults: {
        // Default values are set in the model
      },
    });

    return metric;
  }

  async updateMonthlyMetric(coachId, monthId, updateData) {
    const metric = await this.getOrCreateMonthlyMetric(coachId, monthId);
    return await metric.update(updateData);
  }

  async getMonthlyMetrics(coachId, { year, limit } = {}) {
    const include = [
      {
        model: Month,
        as: "month",
        attributes: ["monthId", "monthName", "yearId"],
        required: true,
      },
    ];

    if (year) {
      include[0].where = { year };
    }

    const options = {
      where: { coachId },
      include,
      order: [[include[0].as, "monthNumber", "DESC"]],
    };

    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    return await MonthlyCoachMetric.findAll(options);
  }

  // Batch monthly metrics
  async getOrCreateBatchMonthlyMetric(batchId, monthId) {
    // First get the coach ID for this batch
    const batch = await CoachBatch.findByPk(batchId);
    if (!batch) throw new Error("Batch not found");

    const [metric, created] = await BatchMonthlyMetric.findOrCreate({
      where: { batchId, monthId },
      defaults: {
        coachId: batch.coachId,
        // Other defaults set in model
      },
    });

    return metric;
  }

  async updateBatchMonthlyMetric(batchId, monthId, updateData) {
    const metric = await this.getOrCreateBatchMonthlyMetric(batchId, monthId);
    return await metric.update(updateData);
  }

  async getBatchMonthlyMetrics(batchId, { year, limit } = {}) {
    const include = [
      {
        model: Month,
        as: "month",
        attributes: ["monthId", "monthName", "yearId"],
        required: true,
      },
    ];

    if (year) {
      include[0].where = { year };
    }

    const options = {
      where: { batchId },
      include,
      order: [[include[0].as, "monthNumber", "DESC"]],
    };

    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    return await BatchMonthlyMetric.findAll(options);
  }

  // Analytics calculation methods
  async calculateCoachRevenue(coachId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Calculate total revenue for the month
    const totalRevenue =
      (await CoachPayment.sum("amount", {
        where: {
          coachId,
          status: "completed",
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      })) || 0;

    // Get revenue by day of week
    const payments = await CoachPayment.findAll({
      where: {
        coachId,
        status: "completed",
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["amount", "createdAt"],
    });

    // Days of week
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dailyRevenue = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    // Aggregate revenue by day of week
    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const dayName = days[date.getDay()];
      dailyRevenue[dayName] += parseFloat(payment.amount);
    });

    return { totalRevenue, dailyRevenue };
  }

  async calculateBatchRevenue(batchId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Calculate total revenue for the batch in this month
    const totalRevenue =
      (await CoachPayment.sum("amount", {
        where: {
          batchId,
          status: "completed",
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      })) || 0;

    // Get revenue by day of week
    const payments = await CoachPayment.findAll({
      where: {
        batchId,
        status: "completed",
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["amount", "createdAt"],
    });

    // Days of week
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dailyRevenue = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    // Aggregate revenue by day of week
    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const dayName = days[date.getDay()];
      dailyRevenue[dayName] += parseFloat(payment.amount);
    });

    return { totalRevenue, dailyRevenue };
  }

  async calculateCoachSessionMetrics(coachId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Count total sessions
    const totalSessions = await CoachSession.count({
      where: {
        coach_id: coachId,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    // Count completed sessions
    const completedSessions = await CoachSession.count({
      where: {
        coach_id: coachId,
        is_completed: true,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    // Count cancelled sessions
    const cancelledSessions = await CoachSession.count({
      where: {
        coach_id: coachId,
        is_cancelled: true,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    // Get sessions by hour
    const sessions = await CoachSession.findAll({
      where: {
        coach_id: coachId,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
      attributes: ["start_time"],
    });

    // Aggregate sessions by hour
    const hourlySessionDistribution = {};
    sessions.forEach((session) => {
      if (session.start_time) {
        // Extract hour from time (HH:MM:SS format)
        const hour = session.start_time.split(":")[0] + ":00";
        hourlySessionDistribution[hour] =
          (hourlySessionDistribution[hour] || 0) + 1;
      }
    });

    // Calculate session hours (assuming each session is typically 1 hour)
    const sessionHours = completedSessions;

    return {
      totalSessions,
      completedSessions,
      cancelledSessions,
      hourlySessionDistribution,
      sessionHours,
    };
  }

  async calculateBatchSessionMetrics(batchId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Count total sessions
    const totalSessions = await CoachSession.count({
      where: {
        batch_id: batchId,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    // Count completed sessions
    const completedSessions = await CoachSession.count({
      where: {
        batch_id: batchId,
        is_completed: true,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    // Count cancelled sessions
    const cancelledSessions = await CoachSession.count({
      where: {
        batch_id: batchId,
        is_cancelled: true,
        date: {
          [Op.between]: [
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
          ],
        },
      },
    });

    return { totalSessions, completedSessions, cancelledSessions };
  }

  async calculateCoachStudentMetrics(coachId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Get previous month for growth calculation
    const previousMonthStart = new Date(year, monthNum - 1, 1);
    const previousMonthEnd = new Date(year, monthNum, 0);

    // Count total active students (all students with this coach at the end of month)
    const activeStudents = await CoachStudent.count({
      where: {
        coachId,
        [Op.or]: [
          { createdAt: { [Op.lte]: endDate } },
          { updatedAt: { [Op.lte]: endDate } },
        ],
      },
    });

    // Count new students added this month
    const newStudents = await CoachStudent.count({
      where: {
        coachId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Get previous month's active students for retention calculation
    const previousMonthStudents = await CoachStudent.count({
      where: {
        coachId,
        [Op.or]: [
          { createdAt: { [Op.lte]: previousMonthEnd } },
          { updatedAt: { [Op.lte]: previousMonthEnd } },
        ],
      },
    });

    // Calculate growth and retention rates
    const growthRate =
      previousMonthStudents > 0
        ? ((activeStudents - previousMonthStudents) / previousMonthStudents) *
          100
        : newStudents > 0
        ? 100
        : 0;

    const retentionRate =
      previousMonthStudents > 0
        ? ((activeStudents - newStudents) / previousMonthStudents) * 100
        : 0;

    return {
      activeStudents,
      newStudents,
      growthRate: parseFloat(growthRate.toFixed(2)),
      retentionRate: parseFloat(retentionRate.toFixed(2)),
    };
  }

  async calculateBatchStudentMetrics(batchId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Count active students in this batch
    const activeStudents = await CoachStudent.count({
      where: {
        batchId,
        [Op.or]: [
          { createdAt: { [Op.lte]: endDate } },
          { updatedAt: { [Op.lte]: endDate } },
        ],
      },
    });

    // Count new students added to this batch this month
    const newStudents = await CoachStudent.count({
      where: {
        batchId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Calculate attendance rate (if you have attendance records)
    // This is a placeholder - implement based on your attendance tracking
    const attendanceRate = 90; // Default 90% for now

    return { activeStudents, newStudents, attendanceRate };
  }

  async calculateCoachRatingMetrics(coachId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Get all reviews for this coach in this month
    const reviews = await CoachReview.findAll({
      where: {
        coachId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
        [sequelize.fn("COUNT", sequelize.col("rating")), "count"],
      ],
    });

    const avgRating = reviews[0]?.getDataValue("avgRating") || 0;
    const reviewCount = reviews[0]?.getDataValue("count") || 0;

    return {
      averageRating: parseFloat(avgRating).toFixed(2),
      totalReviews: parseInt(reviewCount),
    };
  }

  async calculateBatchRatingMetrics(batchId, monthId) {
    // First get the coach ID for this batch
    const batch = await CoachBatch.findByPk(batchId);
    if (!batch) throw new Error("Batch not found");

    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Get batch-specific reviews if available (this depends on your data model)
    // If you don't store batch ID in reviews, you may need a different approach
    const reviews = await CoachReview.findAll({
      where: {
        coachId: batch.coachId,
        batchId, // If your reviews have batchId
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
        [sequelize.fn("COUNT", sequelize.col("rating")), "count"],
      ],
    });

    const avgRating = reviews[0]?.getDataValue("avgRating") || 0;
    const reviewCount = reviews[0]?.getDataValue("count") || 0;

    return {
      averageRating: parseFloat(avgRating).toFixed(2),
      totalReviews: parseInt(reviewCount),
    };
  }

  async calculateCoachUtilizationRate(coachId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // Count total slots available in the month (based on batches and their schedule)
    let totalSlotsAvailable = 0;

    // Get all active batches for this coach
    const batches = await CoachBatch.findAll({
      where: {
        coachId,
        status: "active",
      },
    });

    // For each batch, calculate the number of slots based on schedule
    // This is a simplified calculation and would need to be adapted to your specific scheduling system
    for (const batch of batches) {
      // Assuming each batch has scheduled days (Monday-Sunday, stored as 0-6)
      // This is just an example - replace with your actual batch schedule logic
      const batchDays = batch.daysOfWeek || []; // Example: Monday, Wednesday, Friday

      // Count days in the month that match the batch's schedule
      let daysInMonth = 0;
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (batchDays.includes(currentDate.getDay())) {
          daysInMonth++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Each day has one slot for this batch
      totalSlotsAvailable += daysInMonth;
    }

    // Count total booked slots in the month
    const bookedSlots = await CoachSession.count({
      where: {
        coach_id: coachId,
        status: "booked",
        date: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
    });

    // Calculate utilization rate
    const utilizationRate =
      totalSlotsAvailable > 0 ? (bookedSlots / totalSlotsAvailable) * 100 : 0;

    return {
      totalSlots: totalSlotsAvailable,
      bookedSlots,
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
    };
  }

  async calculateBatchUtilizationRate(batchId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");

    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month

    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // Get batch details
    const batch = await CoachBatch.findByPk(batchId);
    if (!batch) throw new Error("Batch not found");

    // Calculate total slots available for this batch in the month
    // Assuming each batch has scheduled days (Monday-Sunday, stored as 0-6)
    // This is just an example - replace with your actual batch schedule logic
    const batchDays = batch.daysOfWeek || []; // Example: Monday, Wednesday, Friday

    // Count days in the month that match the batch's schedule
    let totalSlotsAvailable = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (batchDays.includes(currentDate.getDay())) {
        totalSlotsAvailable++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count booked slots for this batch in the month
    const bookedSlots = await CoachSession.count({
      where: {
        batch_id: batchId,
        status: "booked",
        date: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
    });

    // Calculate utilization rate
    const utilizationRate =
      totalSlotsAvailable > 0 ? (bookedSlots / totalSlotsAvailable) * 100 : 0;

    return {
      totalSlots: totalSlotsAvailable,
      bookedSlots,
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
    };
  }

  async incrementMetricCounter(coachId, monthId, field, amount = 1) {
    try {
      const [metric, created] = await MonthlyCoachMetric.findOrCreate({
        where: { coachId, monthId },
        defaults: {
          coachId,
          monthId,
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          totalRevenue: 0,
          newStudents: 0,
          activeStudents: 0,
          averageRating: 0,
          totalReviews: 0,
        },
      });

      metric[field] = (metric[field] || 0) + amount;
      await metric.save();

      return metric;
    } catch (error) {
      console.error("Error incrementing coach metric counter:", error);
      throw error;
    }
  }

  async incrementBatchMetricCounter(batchId, monthId, field, amount = 1) {
    try {
      const batch = await CoachBatch.findByPk(batchId);
      if (!batch) throw new Error("Batch not found");

      const [metric, created] = await BatchMonthlyMetric.findOrCreate({
        where: { batchId, monthId, coachId: batch.coachId },
        defaults: {
          batchId,
          monthId,
          coachId: batch.coachId,
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          totalRevenue: 0,
          averageAttendance: 0,
          studentProgress: 0,
        },
      });

      metric[field] = (metric[field] || 0) + amount;
      await metric.save();

      return metric;
    } catch (error) {
      console.error("Error incrementing batch metric counter:", error);
      throw error;
    }
  }

  async recalculateMetricsFromSessions(coachId, monthId) {
    try {
      // Get all sessions for this coach and month
      const sessions = await CoachSession.findAll({
        where: { coachId, monthId },
      });

      const metrics = {
        totalSessions: sessions.length,
        completedSessions: sessions.filter((s) => s.status === "completed")
          .length,
        cancelledSessions: sessions.filter((s) => s.status === "cancelled")
          .length,
      };

      // Calculate revenue from payments
      const payments = await CoachPayment.findAll({
        where: { coachId, monthId },
      });
      metrics.totalRevenue = payments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      // Update or create metric record
      const [metric, created] = await MonthlyCoachMetric.findOrCreate({
        where: { coachId, monthId },
        defaults: metrics,
      });

      if (!created) {
        await metric.update(metrics);
      }

      return metric;
    } catch (error) {
      console.error("Error recalculating coach metrics from sessions:", error);
      throw error;
    }
  }

  async updateAllCoachMetrics(coachId, monthId) {
    try {
      // Calculate all metrics
      const revenueData = await this.calculateCoachRevenue(coachId, monthId);
      const sessionData = await this.calculateCoachSessionMetrics(
        coachId,
        monthId
      );
      const studentData = await this.calculateCoachStudentMetrics(
        coachId,
        monthId
      );
      const ratingData = await this.calculateCoachRatingMetrics(
        coachId,
        monthId
      );
      const utilizationData = await this.calculateCoachUtilizationRate(
        coachId,
        monthId
      );

      // Get all active batches
      const batches = await CoachBatch.findAll({
        where: {
          coachId,
          status: "active",
        },
      });

      // Calculate batch metrics
      const batchMetrics = {};
      for (const batch of batches) {
        const batchId = batch.batchId;

        // Calculate individual batch metrics
        const batchRevenue = await this.calculateBatchRevenue(batchId, monthId);
        const batchSessions = await this.calculateBatchSessionMetrics(
          batchId,
          monthId
        );
        const batchStudents = await this.calculateBatchStudentMetrics(
          batchId,
          monthId
        );
        const batchRatings = await this.calculateBatchRatingMetrics(
          batchId,
          monthId
        );
        const batchUtilization = await this.calculateBatchUtilizationRate(
          batchId,
          monthId
        );

        // Update individual batch metrics
        await this.updateBatchMonthlyMetric(batchId, monthId, {
          totalSessions: batchSessions.totalSessions,
          completedSessions: batchSessions.completedSessions,
          cancelledSessions: batchSessions.cancelledSessions,
          totalRevenue: batchRevenue.totalRevenue,
          dailyRevenue: batchRevenue.dailyRevenue,
          activeStudents: batchStudents.activeStudents,
          newStudents: batchStudents.newStudents,
          attendanceRate: batchStudents.attendanceRate,
          averageRating: batchRatings.averageRating,
          totalReviews: batchRatings.totalReviews,
          utilization: batchUtilization.utilizationRate,
        });

        // Store batch metrics in the coach metric
        batchMetrics[batchId] = {
          name: batch.batchName,
          sessions: batchSessions.totalSessions,
          revenue: parseFloat(batchRevenue.totalRevenue),
          students: batchStudents.activeStudents,
          rating: parseFloat(batchRatings.averageRating),
          utilization: batchUtilization.utilizationRate,
        };
      }

      // Update the coach metric with all calculated data
      await this.updateMonthlyMetric(coachId, monthId, {
        totalSessions: sessionData.totalSessions,
        completedSessions: sessionData.completedSessions,
        cancelledSessions: sessionData.cancelledSessions,
        totalRevenue: revenueData.totalRevenue,
        dailyRevenue: revenueData.dailyRevenue,
        activeStudents: studentData.activeStudents,
        newStudents: studentData.newStudents,
        growthRate: studentData.growthRate,
        retentionRate: studentData.retentionRate,
        averageRating: ratingData.averageRating,
        totalReviews: ratingData.totalReviews,
        sessionHours: sessionData.sessionHours,
        hourlySessionDistribution: sessionData.hourlySessionDistribution,
        utilization: utilizationData.utilizationRate,
        batchMetrics,
      });

      return {
        revenue: parseFloat(revenueData.totalRevenue),
        sessions: sessionData.totalSessions,
        students: studentData.activeStudents,
        rating: parseFloat(ratingData.averageRating),
        utilization: utilizationData.utilizationRate,
        batches: Object.keys(batchMetrics).length,
      };
    } catch (err) {
      console.error(`Error updating coach metrics: ${err.message}`);
      throw err;
    }
  }

  async getCoachScoreEffectiveness(coachId, monthId) {
    const metric = await MonthlyCoachMetric.findOne({
      where: { coachId, monthId },
      attributes: [
        "coachingEffectiveness",
        "scoreBasedInsights",
        "achievementsMilestones",
      ],
    });

    return metric ? metric.toJSON() : null;
  }

  async calculateStudentImprovementRate(coachId, months = 3) {
    const query = `
      WITH student_progress AS (
        SELECT 
          msp."userId",
          msp."monthId",
          (msp."sportScores"->>'overall')::float as overall_score,
          ROW_NUMBER() OVER (PARTITION BY msp."userId" ORDER BY m."monthNumber") as month_rank
        FROM "MonthlyStudentProgress" msp
        JOIN "Months" m ON msp."monthId" = m."monthId"
        WHERE msp."coachId" = :coachId
        AND m."createdAt" >= :cutoffDate
      ),
      improvement_calc AS (
        SELECT 
          sp1."userId",
          sp1.overall_score as latest_score,
          sp2.overall_score as earliest_score,
          (sp1.overall_score - sp2.overall_score) as improvement
        FROM student_progress sp1
        JOIN student_progress sp2 ON sp1."userId" = sp2."userId"
        WHERE sp1.month_rank = (SELECT MAX(month_rank) FROM student_progress WHERE "userId" = sp1."userId")
        AND sp2.month_rank = 1
      )
      SELECT 
        COUNT(*) as total_students,
        AVG(improvement) as average_improvement,
        COUNT(CASE WHEN improvement > 0 THEN 1 END) as students_improved,
        COUNT(CASE WHEN improvement < 0 THEN 1 END) as students_declined,
        COUNT(CASE WHEN improvement = 0 THEN 1 END) as students_stable
      FROM improvement_calc
    `;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const [result] = await sequelize.query(query, {
      replacements: { coachId, cutoffDate },
      type: sequelize.QueryTypes.SELECT,
    });

    return result;
  }

  async getBatchScoreComparison(coachId) {
    const batches = await CoachBatch.findAll({
      where: { coachId },
      include: [
        {
          model: BatchMonthlyMetric,
          as: "monthlyMetrics",
          attributes: ["batchScoreMetrics", "scoreImprovements"],
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    return batches.map((batch) => ({
      batchId: batch.batchId,
      batchName: batch.batchName,
      scoreMetrics: batch.monthlyMetrics[0]?.batchScoreMetrics || {},
      improvements: batch.monthlyMetrics[0]?.scoreImprovements || {},
    }));
  }

  async getTopPerformingStudents(coachId, limit = 10) {
    const students = await CoachStudent.findAll({
      where: {
        coachId,
        currentScores: { [Op.ne]: null },
      },
      attributes: ["userId", "currentScores", "achievementFlags"],
      include: [
        {
          model: sequelize.models.User,
          as: "student",
          attributes: ["first_name", "last_name"],
        },
      ],
      order: [
        [sequelize.literal(`("currentScores"->>'overall')::float`), "DESC"],
      ],
      limit,
    });

    return students;
  }

  async getCoachingInsights(coachId, monthId) {
    // Get student performance data
    const studentData = await this.calculateStudentImprovementRate(coachId, 3);

    // Get score distribution across categories
    const categoryQuery = `
      SELECT 
        jsonb_object_keys(cs."currentScores"->'breakdown') as category,
        AVG((cs."currentScores"->'breakdown'->>jsonb_object_keys(cs."currentScores"->'breakdown'))::float) as avg_score
      FROM "CoachStudents" cs
      WHERE cs."coachId" = :coachId
      AND cs."currentScores" IS NOT NULL
      GROUP BY category
      ORDER BY avg_score DESC
    `;

    const categoryScores = await sequelize.query(categoryQuery, {
      replacements: { coachId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Generate insights based on data
    const insights = {
      totalStudents: studentData.total_students || 0,
      averageImprovement: parseFloat(
        studentData.average_improvement || 0
      ).toFixed(2),
      improvementRate:
        studentData.total_students > 0
          ? parseFloat(
              (studentData.students_improved / studentData.total_students) * 100
            ).toFixed(1)
          : 0,
      strongestCategories: categoryScores.slice(0, 3).map((c) => c.category),
      improvementAreas: categoryScores.slice(-2).map((c) => c.category),
      categoryBreakdown: categoryScores,
    };

    return insights;
  }

  async updateCoachEffectivenessMetrics(coachId, monthId) {
    const insights = await this.getCoachingInsights(coachId, monthId);
    const studentData = await this.calculateStudentImprovementRate(coachId, 1);

    const effectivenessData = {
      coachingEffectiveness: {
        averageStudentImprovement: insights.averageImprovement,
        studentsImproved: insights.improvementRate,
        strongestCategories: insights.strongestCategories,
        focusAreas: insights.improvementAreas,
        studentSatisfactionScore: 0, // Can be calculated from reviews
      },
      scoreBasedInsights: {
        teachingStrengths: insights.strongestCategories,
        improvementOpportunities: insights.improvementAreas,
        studentProgressDistribution: {
          rapid_improvement: studentData.students_improved || 0,
          steady_progress: studentData.students_stable || 0,
          needs_attention: studentData.students_declined || 0,
        },
        recommendedActions: this.generateRecommendations(insights),
      },
    };

    // Update the MonthlyCoachMetric
    const [metric, created] = await MonthlyCoachMetric.findOrCreate({
      where: { coachId, monthId },
      defaults: effectivenessData,
    });

    if (!created) {
      await metric.update(effectivenessData);
    }

    return metric;
  }

  generateRecommendations(insights) {
    const recommendations = [];

    if (insights.improvementAreas.includes("fitness")) {
      recommendations.push("Focus more on fitness drills and conditioning");
    }

    if (insights.improvementAreas.includes("technique")) {
      recommendations.push(
        "Implement more technique-focused training sessions"
      );
    }

    if (parseFloat(insights.improvementRate) < 70) {
      recommendations.push(
        "Review coaching methodology to improve student engagement"
      );
    }

    if (insights.categoryBreakdown.length > 0) {
      const lowestCategory =
        insights.categoryBreakdown[insights.categoryBreakdown.length - 1];
      if (lowestCategory.avg_score < 6.0) {
        recommendations.push(
          `Special attention needed for ${lowestCategory.category} development`
        );
      }
    }

    return recommendations;
  }
}

module.exports = new CoachAnalyticsRepository();
