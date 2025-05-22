const { 
  sequelize, 
  Supplier, 
  MonthlyCoachMetric, 
  Month, 
  BatchMonthlyMetric,
  TurfMonthlyMetric,
  AcademyMetric,
  CoachProfile,
  AcademyProfile,
  TurfProfile
} = require("../../../database");
const { Op } = require("sequelize");

class SupplierAnalyticsRepository {
  
  async getSupplierOverviewAnalytics(supplierId, period = 6) {
    // Get the supplier with all profiles
    const supplier = await Supplier.findByPk(supplierId, {
      include: [
        { model: CoachProfile, as: "coachProfile" },
        { model: AcademyProfile, as: "academyProfiles" },
        { model: TurfProfile, as: "turfProfiles" }
      ]
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Get the last 'period' months
    const now = new Date();
    const months = await Month.findAll({
      where: {
        [Op.or]: [
          {
            year: now.getFullYear(),
            monthNumber: { [Op.lte]: now.getMonth() + 1 }
          },
          {
            year: now.getFullYear() - 1,
            monthNumber: { [Op.gt]: now.getMonth() + 1 }
          }
        ]
      },
      order: [['year', 'DESC'], ['monthNumber', 'DESC']],
      limit: period
    });

    // Get all the monthIds we need to query
    const monthIds = months.map(month => month.monthId);
    
    // Initialize aggregated metrics
    let totalRevenue = 0;
    let totalBookings = 0;
    const monthlyRevenue = Array(period).fill(0);
    const monthlyBookings = Array(period).fill(0);
    const bookingSources = {
      website: 0,
      app: 0,
      direct: 0,
      partners: 0,
      other: 0
    };
    
    // Aggregate Coach metrics if supplier has a coach profile
    if (supplier.coachProfile) {
      const coachId = supplier.coachProfile.coachId;
      
      // Get coach monthly metrics
      const coachMetrics = await MonthlyCoachMetric.findAll({
        where: {
          coachId,
          monthId: { [Op.in]: monthIds }
        }
      });
      
      // Aggregate metrics
      for (const metric of coachMetrics) {
        const monthIndex = monthIds.indexOf(metric.monthId);
        if (monthIndex !== -1) {
          totalRevenue += parseFloat(metric.totalRevenue || 0);
          totalBookings += metric.totalSessions || 0;
          
          monthlyRevenue[monthIndex] += parseFloat(metric.totalRevenue || 0);
          monthlyBookings[monthIndex] += metric.totalSessions || 0;
          
          // Add booking sources if available
          if (metric.bookingSources) {
            const sources = metric.bookingSources;
            bookingSources.website += sources.website || 0;
            bookingSources.app += sources.app || 0;
            bookingSources.direct += sources.direct || 0;
            bookingSources.partners += sources.partners || 0;
            bookingSources.other += sources.other || 0;
          }
        }
      }
    }
    
    // Aggregate Academy metrics if supplier has academy profiles
    if (supplier.academyProfiles && supplier.academyProfiles.length > 0) {
      const academyIds = supplier.academyProfiles.map(profile => profile.academyId);
      
      // Get academy metrics
      const academyMetrics = await AcademyMetric.findAll({
        where: {
          academyId: { [Op.in]: academyIds },
          monthId: { [Op.in]: monthIds }
        }
      });
      
      // Aggregate metrics
      for (const metric of academyMetrics) {
        const monthIndex = monthIds.indexOf(metric.monthId);
        if (monthIndex !== -1) {
          totalRevenue += parseFloat(metric.revenue || 0);
          totalBookings += metric.enrollments || 0;
          
          monthlyRevenue[monthIndex] += parseFloat(metric.revenue || 0);
          monthlyBookings[monthIndex] += metric.enrollments || 0;
          
          // Add booking sources if available
          if (metric.enrollmentSources) {
            const sources = metric.enrollmentSources;
            bookingSources.website += sources.website || 0;
            bookingSources.app += sources.app || 0;
            bookingSources.direct += sources.direct || 0;
            bookingSources.partners += sources.partners || 0;
            bookingSources.other += sources.other || 0;
          }
        }
      }
    }
    
    // Aggregate Turf metrics if supplier has turf profiles
    if (supplier.turfProfiles && supplier.turfProfiles.length > 0) {
      const turfIds = supplier.turfProfiles.map(profile => profile.turfId);
      
      // Get turf metrics
      const turfMetrics = await TurfMonthlyMetric.findAll({
        where: {
          turfId: { [Op.in]: turfIds },
          monthId: { [Op.in]: monthIds }
        }
      });
      
      // Aggregate metrics
      for (const metric of turfMetrics) {
        const monthIndex = monthIds.indexOf(metric.monthId);
        if (monthIndex !== -1) {
          totalRevenue += parseFloat(metric.totalRevenue || 0);
          totalBookings += metric.totalBookings || 0;
          
          monthlyRevenue[monthIndex] += parseFloat(metric.totalRevenue || 0);
          monthlyBookings[monthIndex] += metric.totalBookings || 0;
          
          // Add booking sources if available
          if (metric.bookingSources) {
            const sources = metric.bookingSources;
            bookingSources.website += sources.website || 0;
            bookingSources.app += sources.app || 0;
            bookingSources.direct += sources.direct || 0;
            bookingSources.partners += sources.partners || 0;
            bookingSources.other += sources.other || 0;
          }
        }
      }
    }
    
    // Calculate average booking value and capacity utilization
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    
    // Calculate capacity utilization across all entities
    // This is a simplified example - you may need to adjust based on your business logic
    let capacityUtilization = 0;
    let utilizationCount = 0;
    
    // Get coach utilization
    if (supplier.coachProfile) {
      const coachMetrics = await MonthlyCoachMetric.findAll({
        where: {
          coachId: supplier.coachProfile.coachId,
          monthId: { [Op.in]: monthIds }  // Just use the most recent month
        }
      });
      
      if (coachMetrics.length > 0) {
        capacityUtilization += parseFloat(coachMetrics[0].utilization || 0);
        utilizationCount++;
      }
    }
    
    // Get turf utilization
    if (supplier.turfProfiles && supplier.turfProfiles.length > 0) {
      const turfIds = supplier.turfProfiles.map(profile => profile.turfId);
      
      const turfMetrics = await TurfMonthlyMetric.findAll({
        where: {
          turfId: { [Op.in]: turfIds },
          monthId: { [Op.in]: monthIds } // Just use the most recent month
        }
      });
      
      for (const metric of turfMetrics) {
        capacityUtilization += parseFloat(metric.utilization || 0);
        utilizationCount++;
      }
    }
    
    // Calculate average utilization
    capacityUtilization = utilizationCount > 0 ? capacityUtilization / utilizationCount : 0;
    
    // Reverse arrays to show chronological order (oldest to newest)
    monthlyRevenue.reverse();
    monthlyBookings.reverse();
    
    // Format month labels
    const monthLabels = months.map(month => `${month.monthNumber}/${month.year}`).reverse();
    
    return {
      totalRevenue,
      totalBookings,
      averageBookingValue: parseFloat(averageBookingValue.toFixed(2)),
      capacityUtilization: parseFloat(capacityUtilization.toFixed(2)),
      monthlyRevenue,
      monthlyBookings,
      monthLabels,
      bookingSources
    };
  }
}

module.exports = new SupplierAnalyticsRepository();