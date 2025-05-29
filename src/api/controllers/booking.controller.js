const userBookingService = require('../../services/user/userBookingService');

class BookingController {
  // Get all user bookings with optional filters
  async getAllUserBookings(req, res) {
    try {
      const { userId } = req.params;
      const { 
        supplier, 
        status, 
        supplierId, 
        limit = 50, 
        offset = 0 
      } = req.query;

      // Validate userId
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const filters = {
        supplier,
        status,
        supplierId,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await userBookingService.getAllUserBookings(userId, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllUserBookings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user bookings by supplier type
  async getBookingsBySupplier(req, res) {
    try {
      const { userId, supplierType } = req.params;
      const { supplierId, status, limit = 50, offset = 0 } = req.query;

      // Validate required parameters
      if (!userId || !supplierType) {
        return res.status(400).json({
          success: false,
          message: 'User ID and supplier type are required'
        });
      }

      // Validate supplier type
      const validSuppliers = ['coach', 'academy', 'turf'];
      if (!validSuppliers.includes(supplierType.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid supplier type. Must be one of: coach, academy, turf'
        });
      }

      let result = await userBookingService.getBookingsBySupplier(userId, supplierType, supplierId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Apply additional filters if needed
      if (status) {
        result.data.bookings = userBookingService.filterByStatus(result.data.bookings, status);
      }

      // Apply pagination
      const total = result.data.bookings.length;
      const paginatedBookings = result.data.bookings.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      result.data = {
        ...result.data,
        bookings: paginatedBookings,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getBookingsBySupplier controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get bookings for a specific supplier (coach/academy/turf)
  async getBookingsForSupplier(req, res) {
    try {
      const { userId, supplierType, supplierId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      // Validate required parameters
      if (!userId || !supplierType || !supplierId) {
        return res.status(400).json({
          success: false,
          message: 'User ID, supplier type, and supplier ID are required'
        });
      }

      const result = await userBookingService.getBookingsBySupplier(userId, supplierType, supplierId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      // Apply status filter if provided
      if (status) {
        result.data.bookings = userBookingService.filterByStatus(result.data.bookings, status);
      }

      // Apply pagination
      const total = result.data.bookings.length;
      const paginatedBookings = result.data.bookings.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      result.data = {
        ...result.data,
        bookings: paginatedBookings,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getBookingsForSupplier controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(req, res) {
    try {
      const { userId } = req.params;
      const { supplier, limit = 10, offset = 0 } = req.query;

      const filters = {
        supplier,
        status: 'upcoming',
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await userBookingService.getAllUserBookings(userId, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getUpcomingBookings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get past bookings
  async getPastBookings(req, res) {
    try {
      const { userId } = req.params;
      const { supplier, limit = 20, offset = 0 } = req.query;

      const filters = {
        supplier,
        status: 'past',
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await userBookingService.getAllUserBookings(userId, filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPastBookings controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new BookingController();