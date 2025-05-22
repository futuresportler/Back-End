const { 
  TurfMonthlyMetric, 
  TurfSlot,
  TurfGround,
  TurfReview, 
  Month,
  sequelize 
} = require("../../../database");
const { Op } = require("sequelize");

class TurfMetricsRepository {
  // Create or retrieve a monthly metric
  async getOrCreateMonthlyMetric(turfId, monthId) {
    const [metric, created] = await TurfMonthlyMetric.findOrCreate({
      where: { turfId, monthId },
      defaults: {
        // Default values are set in the model
      }
    });
    
    return metric;
  }

  // Update a monthly metric
  async updateMonthlyMetric(turfId, monthId, updateData) {
    const metric = await this.getOrCreateMonthlyMetric(turfId, monthId);
    return await metric.update(updateData);
  }

  // Increment a specific counter in a monthly metric
  async incrementMetricCounter(turfId, monthId, field, amount = 1) {
    const metric = await this.getOrCreateMonthlyMetric(turfId, monthId);
    
    // Create update object with only the field to increment
    const updateObj = {};
    updateObj[field] = sequelize.literal(`"${field}" + ${amount}`);
    
    return await metric.update(updateObj);
  }

  // Get monthly metrics for a turf
  async getMonthlyMetrics(turfId, { year, limit } = {}) {
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
      where: { turfId },
      include,
      order: [[include[0].as, "monthNumber", "DESC"]]
    };
    
    if (limit) {
      options.limit = parseInt(limit, 10);
    }
    
    return await TurfMonthlyMetric.findAll(options);
  }

  // Calculate turf utilization rate
  async calculateUtilizationRate(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Count total slots in the month
    const totalSlots = await TurfSlot.count({
      where: {
        turfId,
        date: { 
          [Op.between]: [formattedStartDate, formattedEndDate] 
        }
      }
    });
    
    // Count booked slots in the month
    const bookedSlots = await TurfSlot.count({
      where: {
        turfId,
        status: "booked",
        date: { 
          [Op.between]: [formattedStartDate, formattedEndDate] 
        }
      }
    });
    
    // Calculate utilization rate
    const utilizationRate = totalSlots > 0 
      ? (bookedSlots / totalSlots) * 100 
      : 0;
    
    return {
      totalSlots,
      bookedSlots,
      utilizationRate: parseFloat(utilizationRate.toFixed(2))
    };
  }

  // Calculate revenue by sport
  async calculateRevenueBySort(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Get all booked slots with ground info
    const slots = await TurfSlot.findAll({
      where: {
        turfId,
        status: "booked",
        paymentStatus: "confirmed",
        date: { 
          [Op.between]: [formattedStartDate, formattedEndDate] 
        }
      },
      include: [{
        model: TurfGround,
        as: "ground",
        attributes: ["groundId", "sportType"]
      }],
      attributes: ["slotId", "price"]
    });
    
    // Aggregate revenue by sport
    const sportRevenue = {};
    let totalRevenue = 0;
    
    slots.forEach(slot => {
      if (slot.ground && slot.ground.sportType) {
        const sport = slot.ground.sportType;
        const price = parseFloat(slot.price || 0);
        
        sportRevenue[sport] = (sportRevenue[sport] || 0) + price;
        totalRevenue += price;
      }
    });
    
    return { sportRevenue, totalRevenue };
  }

  // Calculate bookings by hour
  async calculateHourlyBookings(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Get all booked slots
    const slots = await TurfSlot.findAll({
      where: {
        turfId,
        status: "booked",
        date: { 
          [Op.between]: [formattedStartDate, formattedEndDate] 
        }
      },
      attributes: ["startTime"]
    });
    
    // Aggregate bookings by hour
    const hourlyBookings = {};
    
    slots.forEach(slot => {
      if (slot.startTime) {
        // Extract hour from time (HH:MM:SS format)
        const hour = slot.startTime.split(':')[0] + ':00';
        hourlyBookings[hour] = (hourlyBookings[hour] || 0) + 1;
      }
    });
    
    return hourlyBookings;
  }

  // Calculate bookings by day of week
  async calculateDailyBookings(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Get all booked slots
    const slots = await TurfSlot.findAll({
      where: {
        turfId,
        status: "booked",
        date: { 
          [Op.between]: [formattedStartDate, formattedEndDate] 
        }
      },
      attributes: ["date"]
    });
    
    // Days of week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyBookings = {
      "Monday": 0, "Tuesday": 0, "Wednesday": 0, 
      "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0
    };
    
    // Aggregate bookings by day of week
    slots.forEach(slot => {
      if (slot.date) {
        const date = new Date(slot.date);
        const dayName = days[date.getDay()];
        dailyBookings[dayName] += 1;
      }
    });
    
    return dailyBookings;
  }

  // Calculate ground-specific metrics
  async calculateGroundMetrics(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    const year = month.year;
    const monthNum = month.monthNumber - 1; // JS months are 0-indexed
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0); // Last day of month
    
    // Format dates for SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Get all grounds for this turf
    const grounds = await TurfGround.findAll({
      where: { turfId },
      attributes: ["groundId", "name", "sportType"]
    });
    
    const groundMetrics = {};
    
    // For each ground, calculate metrics
    for (const ground of grounds) {
      const groundId = ground.groundId;
      
      // Count total slots
      const totalSlots = await TurfSlot.count({
        where: {
          groundId,
          date: { 
            [Op.between]: [formattedStartDate, formattedEndDate] 
          }
        }
      });
      
      // Count booked slots
      const bookedSlots = await TurfSlot.count({
        where: {
          groundId,
          status: "booked",
          date: { 
            [Op.between]: [formattedStartDate, formattedEndDate] 
          }
        }
      });
      
      // Calculate revenue
      const revenue = await TurfSlot.sum("price", {
        where: {
          groundId,
          status: "booked",
          paymentStatus: "confirmed",
          date: { 
            [Op.between]: [formattedStartDate, formattedEndDate] 
          }
        }
      }) || 0;
      
      // Get ratings
      const reviews = await TurfReview.findAll({
        where: { 
          groundId,
          createdAt: { 
            [Op.between]: [startDate, endDate] 
          }
        },
        attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avgRating"], [sequelize.fn("COUNT", sequelize.col("rating")), "count"]]
      });
      
      const avgRating = reviews[0]?.getDataValue("avgRating") || 0;
      const reviewCount = reviews[0]?.getDataValue("count") || 0;
      
      // Calculate utilization
      const utilization = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
      
      // Store metrics for this ground
      groundMetrics[groundId] = {
        name: ground.name,
        sportType: ground.sportType,
        totalSlots,
        bookedSlots,
        revenue: parseFloat(revenue),
        utilization: parseFloat(utilization.toFixed(2)),
        avgRating: parseFloat(avgRating),
        reviewCount: parseInt(reviewCount)
      };
    }
    
    return groundMetrics;
  }

  // Update all metrics for a turf
  async updateAllMetrics(turfId, monthId) {
    // Get month boundaries
    const month = await Month.findByPk(monthId);
    if (!month) throw new Error("Month not found");
    
    // Calculate all metrics
    const utilizationData = await this.calculateUtilizationRate(turfId, monthId);
    const { sportRevenue, totalRevenue } = await this.calculateRevenueBySort(turfId, monthId);
    const hourlyBookings = await this.calculateHourlyBookings(turfId, monthId);
    const dailyBookings = await this.calculateDailyBookings(turfId, monthId);
    const groundMetrics = await this.calculateGroundMetrics(turfId, monthId);
    
    // Get ratings
    const year = month.year;
    const monthNum = month.monthNumber - 1;
    const startDate = new Date(year, monthNum, 1);
    const endDate = new Date(year, monthNum + 1, 0);
    
    const reviews = await TurfReview.findAll({
      where: { 
        turfId,
        createdAt: { 
          [Op.between]: [startDate, endDate] 
        }
      },
      attributes: [[sequelize.fn("AVG", sequelize.col("rating")), "avgRating"], [sequelize.fn("COUNT", sequelize.col("rating")), "count"]]
    });
    
    const avgRating = reviews[0]?.getDataValue("avgRating") || 0;
    const reviewCount = reviews[0]?.getDataValue("count") || 0;
    
    // Count cancelled bookings
    const cancelledBookings = await TurfSlot.count({
      where: {
        turfId,
        status: "cancelled",
        date: { 
          [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] 
        }
      }
    });
    
    // Update the metric
    await this.updateMonthlyMetric(turfId, monthId, {
      totalBookings: utilizationData.bookedSlots,
      completedBookings: utilizationData.bookedSlots - cancelledBookings,
      cancelledBookings,
      revenue: totalRevenue,
      averageRating: parseFloat(avgRating),
      totalReviews: parseInt(reviewCount),
      utilization: utilizationData.utilizationRate,
      totalSlots: utilizationData.totalSlots,
      sportRevenue,
      hourlyBookings,
      dailyBookings,
      groundMetrics
    });
    
    return {
      totalSlots: utilizationData.totalSlots,
      bookedSlots: utilizationData.bookedSlots,
      utilization: utilizationData.utilizationRate,
      revenue: totalRevenue,
      sportRevenue,
      hourlyBookings,
      dailyBookings,
      groundMetrics,
      averageRating: parseFloat(avgRating),
      reviewCount: parseInt(reviewCount)
    };
  }
}

module.exports = new TurfMetricsRepository();