const turfRepository = require("./repositories/turfRepository");
const { SupplierService } = require("../supplier/index");
const { v4: uuidv4 } = require("uuid");
const slotGenerationService = require("./slotGenerationService");
const turfSearchRepository = require("./repositories/turfSearchRepository");
const turfMetricsRepository = require("./repositories/turfMetricsRepository");

const createTurfProfile = async (supplierId, profileData) => {
  const supplier = await SupplierService.getSupplierByModule(
    supplierId,
    "turf"
  );
  if (!supplier) {
    throw new Error("Supplier not found or not configured for turf");
  }

  // Format location data
  const location = {
    type: "Point",
    coordinates: [profileData.longitude || 0, profileData.latitude || 0],
  };

  return await turfRepository.createTurfProfile({
    ...profileData,
    supplierId,
    turfId: uuidv4(),
    location,
  });
};

const getTurfProfile = async (turfProfileId) => {
  const profile = await turfRepository.findTurfProfileById(turfProfileId);
  if (!profile) throw new Error("Turf profile not found");
  return profile;
};

const getTurfsBySupplier = async (supplierId) => {
  return await turfRepository.findTurfsBySupplierId(supplierId);
};

const updateTurfProfile = async (turfProfileId, updateData) => {
  // If location data is provided, format it
  if (updateData.latitude && updateData.longitude) {
    updateData.location = {
      type: "Point",
      coordinates: [updateData.longitude, updateData.latitude],
    };
    delete updateData.latitude;
    delete updateData.longitude;
  }

  const updated = await turfRepository.updateTurfProfile(
    turfProfileId,
    updateData
  );
  if (!updated) throw new Error("Turf profile not found");
  return updated;
};

const deleteTurfProfile = async (turfProfileId) => {
  const deleted = await turfRepository.deleteTurfProfile(turfProfileId);
  if (!deleted) throw new Error("Turf profile not found");

  // Check if supplier has other turfs
  const remainingTurfs = await turfRepository.findTurfsBySupplierId(
    deleted.supplierId
  );
  if (remainingTurfs.length === 0) {
    await SupplierService.updateSupplierModule(deleted.supplierId, "none");
  }
  return deleted;
};

const getNearbyTurfs = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) throw new Error("Coordinates are required");
  return await turfRepository.findTurfsNearby(latitude, longitude, radius);
};

const addTurfImage = async (turfProfileId, imageUrl, isMainImage = false) => {
  const profile = await turfRepository.findTurfProfileById(turfProfileId);
  if (!profile) throw new Error("Turf profile not found");

  const updateData = {};

  if (isMainImage) {
    updateData.mainImage = imageUrl;
  } else {
    const updatedImages = [...(profile.images || []), imageUrl];
    updateData.images = updatedImages;
  }

  return await turfRepository.updateTurfProfile(turfProfileId, updateData);
};

const getTurfDashboard = async (turfId) => {
  const turf = await turfRepository.findTurfProfileById(turfId);
  if (!turf) throw new Error("Turf not found");

  const quickInfo = await turfRepository.getTurfQuickInfo(turfId);
  const upcomingBookings = await turfRepository.getUpcomingBookings(turfId);
  const todaySchedule = await turfRepository.getTodaySchedule(turfId);
  const bookingRequests = await turfRepository.getBookingRequests(turfId);
  const customerReviews = await turfRepository.getCustomerReviews(turfId);

  return {
    overview: {
      name: turf.name,
      description: turf.description,
      mainImage: turf.mainImage,
      sportsAvailable: turf.sportsAvailable,
      facilities: turf.facilities,
    },
    quickInfo: {
      ...quickInfo,
      rating: turf.rating,
      totalReviews: turf.totalReviews,
      operatingHours: `${turf.openingTime} - ${turf.closingTime}`,
      pricing: {
        hourlyRate: turf.hourlyRate,
        halfDayRate: turf.halfDayRate,
        fullDayRate: turf.fullDayRate,
      },
    },
    upcomingBookings,
    todaySchedule,
    bookingRequests,
    customerReviews,
  };
};

const handleBookingRequest = async (requestId, action) => {
  if (!["accept", "decline"].includes(action)) {
    throw new Error("Invalid action. Must be 'accept' or 'decline'");
  }

  const status = action === "accept" ? "approved" : "rejected";
  const updated = await turfRepository.updateBookingRequestStatus(
    requestId,
    status
  );

  if (!updated) throw new Error("Booking request not found");

  // If accepted, create a slot booking
  if (status === "approved") {
    // Additional logic to create a slot booking would go here
    // This would depend on your slot booking implementation
  }

  return updated;
};

const addReview = async (turfId, userId, reviewData) => {
  const review = await turfRepository.addTurfReview({
    turfId,
    userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    reviewId: uuidv4(),
  });

  return review;
};

// New methods for ground management
const createTurfGround = async (turfId, groundData) => {
  const turf = await turfRepository.findTurfProfileById(turfId);
  if (!turf) throw new Error("Turf profile not found");

  const ground = await turfRepository.createTurfGround({
    ...groundData,
    turfId,
    groundId: uuidv4(),
    status: "active",
  });

  // Generate initial slots for the next 15 days
  await slotGenerationService.generateInitialSlots(ground.groundId);

  return ground;
};

const getTurfGrounds = async (turfId) => {
  return await turfRepository.findGroundsByTurfId(turfId);
};

const getTurfGround = async (groundId) => {
  const ground = await turfRepository.findGroundById(groundId);
  if (!ground) throw new Error("Ground not found");
  return ground;
};

const updateTurfGround = async (groundId, updateData) => {
  const updated = await turfRepository.updateTurfGround(groundId, updateData);
  if (!updated) throw new Error("Ground not found");
  return updated;
};

const deleteTurfGround = async (groundId) => {
  const deleted = await turfRepository.deleteTurfGround(groundId);
  if (!deleted) throw new Error("Ground not found");
  return deleted;
};

const searchTurfs = async (filters) => {
  return await turfSearchRepository.searchTurfs(filters);
};


// Get monthly metrics for a turf
const getMonthlyMetrics = async (turfId, filters = {}) => {
  return await turfMetricsRepository.getMonthlyMetrics(turfId, filters);
};

// Get utilization rate
const getUtilizationRate = async (turfId, monthId) => {
  return await turfMetricsRepository.calculateUtilizationRate(turfId, monthId);
};

// Get revenue by sport
const getRevenueBySort = async (turfId, monthId) => {
  return await turfMetricsRepository.calculateRevenueBySort(turfId, monthId);
};

// Get hourly bookings
const getHourlyBookings = async (turfId, monthId) => {
  return await turfMetricsRepository.calculateHourlyBookings(turfId, monthId);
};

// Get daily bookings
const getDailyBookings = async (turfId, monthId) => {
  return await turfMetricsRepository.calculateDailyBookings(turfId, monthId);
};
// Get ground metrics
const getGroundMetrics = async (turfId, monthId) => {
  return await turfMetricsRepository.calculateGroundMetrics(turfId, monthId);
};

// Refresh metrics
const refreshMetrics = async (turfId, monthId) => {
  return await turfMetricsRepository.updateAllMetrics(turfId, monthId);
};

const getTurfWithPromotionStatus = async (turfProfileId) => {
  return await turfRepository.getTurfWithPromotionStatus(turfProfileId);
};

module.exports = {
  createTurfProfile,
  getTurfProfile,
  getTurfsBySupplier,
  updateTurfProfile,
  deleteTurfProfile,
  getNearbyTurfs,
  addTurfImage,
  getTurfDashboard,
  handleBookingRequest,
  addReview,
  searchTurfs,
  getTurfWithPromotionStatus,
  // Ground management methods
  createTurfGround,
  getTurfGrounds,
  getTurfGround,
  updateTurfGround,
  deleteTurfGround,
  getMonthlyMetrics,
  getUtilizationRate,
  getRevenueBySort,
  getHourlyBookings,
  getDailyBookings,
  getGroundMetrics,
  refreshMetrics
};
