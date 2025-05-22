const { AcademyBookingPlatform, sequelize } = require("../../../database");
const { Op } = require("sequelize");

class AcademyBookingRepository {
  async getBookingPlatforms(academyId, period = 3) {
    // Calculate the date 'period' months ago
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - period);

    // Fetch booking data grouped by platform
    const bookingData = await AcademyBookingPlatform.findAll({
      attributes: [
        'platformName',
        [sequelize.fn('SUM', sequelize.col('bookingsCount')), 'totalBookings']
      ],
      where: {
        academyId,
        createdAt: {
          [Op.gte]: cutoffDate
        }
      },
      group: ['platformName'],
      order: [[sequelize.fn('SUM', sequelize.col('bookingsCount')), 'DESC']]
    });

    return bookingData;
  }

  async recordBookingPlatform(bookingData) {
    // Find existing record first
    const existingRecord = await AcademyBookingPlatform.findOne({
      where: {
        academyId: bookingData.academyId,
        monthId: bookingData.monthId,
        platformName: bookingData.platformName
      }
    });

    if (existingRecord) {
      // Update existing record
      return await existingRecord.update({
        bookingsCount: existingRecord.bookingsCount + (bookingData.count || 1)
      });
    } else {
      // Create new record
      return await AcademyBookingPlatform.create({
        academyId: bookingData.academyId,
        monthId: bookingData.monthId,
        platformName: bookingData.platformName,
        bookingsCount: bookingData.count || 1
      });
    }
  }
}

module.exports = new AcademyBookingRepository();