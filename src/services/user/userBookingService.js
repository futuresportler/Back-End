const sessionService = require('../session/sessionService');

class UserBookingService {
  async getAllUserBookings(userId, filters = {}) {
    try {
      const { supplier, status, supplierId, limit = 50, offset = 0 } = filters;
      let bookings = [];

      // If specific supplier is requested
      if (supplier) {
        switch (supplier.toLowerCase()) {
          case 'coach':
            bookings = await this.getCoachBookings(userId, supplierId);
            break;
          case 'academy':
            bookings = await this.getAcademyBookings(userId, supplierId);
            break;
          case 'turf':
            bookings = await this.getTurfBookings(userId, supplierId);
            break;
          default:
            throw new Error('Invalid supplier type');
        }
      } else {
        // Get all bookings from all suppliers
        const [coachBookings, academyBookings, turfBookings] = await Promise.all([
          this.getCoachBookings(userId),
          this.getAcademyBookings(userId),
          this.getTurfBookings(userId)
        ]);

        bookings = [...coachBookings, ...academyBookings, ...turfBookings];
      }

      // Apply status filter
      if (status) {
        bookings = this.filterByStatus(bookings, status);
      }

      // Sort by date (newest first for past, oldest first for upcoming)
      bookings.sort((a, b) => {
        if (status === 'past') {
          return new Date(b.date) - new Date(a.date);
        }
        return new Date(a.date) - new Date(b.date);
      });

      // Apply pagination
      const total = bookings.length;
      const paginatedBookings = bookings.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          bookings: paginatedBookings,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      };
    } catch (error) {
      console.error('Error in getAllUserBookings:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user bookings'
      };
    }
  }

  async getCoachBookings(userId, coachId = null) {
    try {
      let bookings;
      if (coachId) {
        // Get bookings for specific coach
        bookings = await sessionService.getUserCoachSessions(userId, coachId);
      } else {
        // Get all coach bookings for user
        bookings = await sessionService.getAllUserCoachBookings(userId);
      }

      return this.standardizeBookings(bookings || [], 'coach');
    } catch (error) {
      console.error('Error fetching coach bookings:', error);
      return [];
    }
  }

  async getAcademyBookings(userId, academyId = null) {
    try {
      let bookings;
      if (academyId) {
        // Get bookings for specific academy
        bookings = await sessionService.getUserAcademySessions(userId, academyId);
      } else {
        // Get all academy bookings for user
        bookings = await sessionService.getAllUserAcademyBookings(userId);
      }

      return this.standardizeBookings(bookings || [], 'academy');
    } catch (error) {
      console.error('Error fetching academy bookings:', error);
      return [];
    }
  }

  async getTurfBookings(userId, turfId = null) {
    try {
      let bookings;
      if (turfId) {
        // Get bookings for specific turf
        bookings = await sessionService.getUserTurfSessions(userId, turfId);
      } else {
        // Get all turf bookings for user
        bookings = await sessionService.getAllUserTurfBookings(userId);
      }

      return this.standardizeBookings(bookings || [], 'turf');
    } catch (error) {
      console.error('Error fetching turf bookings:', error);
      return [];
    }
  }

  standardizeBookings(bookings, supplierType) {
    return bookings.map(booking => ({
      id: booking._id || booking.id,
      supplierType,
      supplierId: booking.coachId || booking.academyId || booking.turfId,
      supplierName: booking.coachName || booking.academyName || booking.turfName,
      date: booking.date || booking.sessionDate || booking.bookingDate,
      time: booking.time || booking.sessionTime || booking.timeSlot,
      duration: booking.duration || 60, // default 60 minutes
      status: this.determineBookingStatus(booking.date || booking.sessionDate || booking.bookingDate),
      price: booking.price || booking.amount || booking.fee,
      bookingId: booking.bookingId || booking.sessionId,
      location: booking.location || booking.venue,
      sport: booking.sport || booking.activity,
      createdAt: booking.createdAt || booking.bookedAt,
      originalData: booking // Keep original data for reference
    }));
  }

  determineBookingStatus(date) {
    const bookingDate = new Date(date);
    const now = new Date();
    
    // Reset time to compare only dates
    bookingDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    if (bookingDate < now) {
      return 'past';
    } else if (bookingDate.getTime() === now.getTime()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  }

  filterByStatus(bookings, status) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);

      switch (status.toLowerCase()) {
        case 'upcoming':
          return bookingDate >= now;
        case 'past':
          return bookingDate < now;
        case 'today':
          return bookingDate.getTime() === now.getTime();
        default:
          return true;
      }
    });
  }

  async getBookingsBySupplier(userId, supplierType, supplierId = null) {
    try {
      let bookings;
      
      switch (supplierType.toLowerCase()) {
        case 'coach':
          bookings = await this.getCoachBookings(userId, supplierId);
          break;
        case 'academy':
          bookings = await this.getAcademyBookings(userId, supplierId);
          break;
        case 'turf':
          bookings = await this.getTurfBookings(userId, supplierId);
          break;
        default:
          throw new Error('Invalid supplier type');
      }

      return {
        success: true,
        data: {
          bookings,
          supplierType,
          supplierId
        }
      };
    } catch (error) {
      console.error('Error in getBookingsBySupplier:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch supplier bookings'
      };
    }
  }
}

module.exports = new UserBookingService();