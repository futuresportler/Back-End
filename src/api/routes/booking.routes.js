const express = require('express');
const bookingController = require('../controllers/booking.controller');

const router = express.Router();

// Get all user bookings with optional filters
// GET /api/bookings/user/:userId?supplier=coach&status=upcoming&limit=20&offset=0
router.get('/user/:userId', bookingController.getAllUserBookings);

// Get user bookings by supplier type
// GET /api/bookings/user/:userId/supplier/:supplierType?status=upcoming&limit=20
router.get('/user/:userId/supplier/:supplierType', bookingController.getBookingsBySupplier);

// Get bookings for a specific supplier
// GET /api/bookings/user/:userId/supplier/:supplierType/:supplierId?status=past
router.get('/user/:userId/supplier/:supplierType/:supplierId', bookingController.getBookingsForSupplier);

// Get upcoming bookings
// GET /api/bookings/user/:userId/upcoming?supplier=coach&limit=10
router.get('/user/:userId/upcoming', bookingController.getUpcomingBookings);

// Get past bookings  
// GET /api/bookings/user/:userId/past?supplier=academy&limit=20
router.get('/user/:userId/past', bookingController.getPastBookings);

module.exports = router;