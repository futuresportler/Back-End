const { academyService } = require("../../services/academy");
const coachService = require("../../services/coach");
const { turfService } = require("../../services/turf");
const {
  successResponse,
  errorResponse,
} = require("../../common/utils/response");
const { sequelize } = require("../../database");
const { Op } = require("sequelize");

// Academy search with filtering
const getAllAcademies = async (req, res) => {
  try {
    const {
      city,
      sport,
      rating,
      ageGroup,
      classType,
      minPrice,
      maxPrice,
      facilities,
      page = 1,
      limit = 20,
      latitude,
      longitude,
      radius,
      sortBy = "priority",
    } = req.query;

    const filters = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sortBy,
    };

    // Add filters if they exist
    if (city) filters.city = city;
    if (sport) filters.sport = sport;
    if (rating) filters.minRating = Number.parseFloat(rating);
    if (ageGroup) filters.ageGroup = ageGroup;
    if (classType) filters.classType = classType;
    if (minPrice) filters.minPrice = Number.parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = Number.parseFloat(maxPrice);
    if (facilities) filters.facilities = facilities.split(",");
    if (latitude && longitude) {
      filters.latitude = Number.parseFloat(latitude);
      filters.longitude = Number.parseFloat(longitude);
      filters.radius = radius ? Number.parseFloat(radius) : 5000; // Default 5km
    }

    const academies = await academyService.searchAcademies(filters);
    successResponse(res, "Academies fetched successfully", academies);
  } catch (error) {
    errorResponse(res, error.message || "Failed to fetch academies", error);
  }
};

// Coach search with filtering
const getAllCoaches = async (req, res) => {
  try {
    const {
      city,
      sport,
      rating,
      ageGroup,
      classType,
      minPrice,
      maxPrice,
      experience,
      page = 1,
      limit = 20,
      latitude,
      longitude,
      radius,
      sortBy = "priority",
    } = req.query;

    const filters = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sortBy,
    };

    // Add filters if they exist
    if (city) filters.city = city;
    if (sport) filters.sport = sport;
    if (rating) filters.minRating = Number.parseFloat(rating);
    if (ageGroup) filters.ageGroup = ageGroup;
    if (classType) filters.classType = classType;
    if (minPrice) filters.minPrice = Number.parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = Number.parseFloat(maxPrice);
    if (experience) filters.minExperience = Number.parseInt(experience);
    if (latitude && longitude) {
      filters.latitude = Number.parseFloat(latitude);
      filters.longitude = Number.parseFloat(longitude);
      filters.radius = radius ? Number.parseFloat(radius) : 5000; // Default 5km
    }

    const coaches = await coachService.searchCoaches(filters);
    successResponse(res, "Coaches fetched successfully", coaches);
  } catch (error) {
    errorResponse(res, error.message || "Failed to fetch coaches", error);
  }
};

// Turf search with filtering
const getAllTurfs = async (req, res) => {
  try {
    const {
      city,
      sport,
      rating,
      turfType,
      minPrice,
      maxPrice,
      facilities,
      page = 1,
      limit = 20,
      latitude,
      longitude,
      radius,
      sortBy = "priority",
    } = req.query;

    const filters = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sortBy,
    };

    // Add filters if they exist
    if (city) filters.city = city;
    if (sport) filters.sport = sport;
    if (rating) filters.minRating = Number.parseFloat(rating);
    if (turfType) filters.turfType = turfType;
    if (minPrice) filters.minPrice = Number.parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = Number.parseFloat(maxPrice);
    if (facilities) filters.facilities = facilities.split(",");
    if (latitude && longitude) {
      filters.latitude = Number.parseFloat(latitude);
      filters.longitude = Number.parseFloat(longitude);
      filters.radius = radius ? Number.parseFloat(radius) : 5000; // Default 5km
    }

    const turfs = await turfService.searchTurfs(filters);
    successResponse(res, "Turfs fetched successfully", turfs);
  } catch (error) {
    errorResponse(res, error.message || "Failed to fetch turfs", error);
  }
};

// City-based search routes
const getAcademiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    // Convert to proper types
    if (filters.page) filters.page = Number.parseInt(filters.page);
    if (filters.limit) filters.limit = Number.parseInt(filters.limit);
    if (filters.minRating)
      filters.minRating = Number.parseFloat(filters.minRating);
    if (filters.minPrice)
      filters.minPrice = Number.parseFloat(filters.minPrice);
    if (filters.maxPrice)
      filters.maxPrice = Number.parseFloat(filters.maxPrice);
    if (filters.facilities) filters.facilities = filters.facilities.split(",");
    if (filters.latitude && filters.longitude) {
      filters.latitude = Number.parseFloat(filters.latitude);
      filters.longitude = Number.parseFloat(filters.longitude);
      filters.radius = filters.radius
        ? Number.parseFloat(filters.radius)
        : 5000;
    }

    const academies = await academyService.searchAcademies(filters);
    successResponse(
      res,
      `Academies in ${city} fetched successfully`,
      academies
    );
  } catch (error) {
    errorResponse(
      res,
      error.message || "Failed to fetch academies by city",
      error
    );
  }
};

const getCoachesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    // Convert to proper types
    if (filters.page) filters.page = Number.parseInt(filters.page);
    if (filters.limit) filters.limit = Number.parseInt(filters.limit);
    if (filters.minRating)
      filters.minRating = Number.parseFloat(filters.minRating);
    if (filters.minPrice)
      filters.minPrice = Number.parseFloat(filters.minPrice);
    if (filters.maxPrice)
      filters.maxPrice = Number.parseFloat(filters.maxPrice);
    if (filters.minExperience)
      filters.minExperience = Number.parseInt(filters.minExperience);
    if (filters.latitude && filters.longitude) {
      filters.latitude = Number.parseFloat(filters.latitude);
      filters.longitude = Number.parseFloat(filters.longitude);
      filters.radius = filters.radius
        ? Number.parseFloat(filters.radius)
        : 5000;
    }

    const coaches = await coachService.searchCoaches(filters);
    successResponse(res, `Coaches in ${city} fetched successfully`, coaches);
  } catch (error) {
    errorResponse(
      res,
      error.message || "Failed to fetch coaches by city",
      error
    );
  }
};

const getTurfsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    // Convert to proper types
    if (filters.page) filters.page = Number.parseInt(filters.page);
    if (filters.limit) filters.limit = Number.parseInt(filters.limit);
    if (filters.minRating)
      filters.minRating = Number.parseFloat(filters.minRating);
    if (filters.minPrice)
      filters.minPrice = Number.parseFloat(filters.minPrice);
    if (filters.maxPrice)
      filters.maxPrice = Number.parseFloat(filters.maxPrice);
    if (filters.facilities) filters.facilities = filters.facilities.split(",");
    if (filters.latitude && filters.longitude) {
      filters.latitude = Number.parseFloat(filters.latitude);
      filters.longitude = Number.parseFloat(filters.longitude);
      filters.radius = filters.radius
        ? Number.parseFloat(filters.radius)
        : 5000;
    }

    const turfs = await turfService.searchTurfs(filters);
    successResponse(res, `Turfs in ${city} fetched successfully`, turfs);
  } catch (error) {
    errorResponse(res, error.message || "Failed to fetch turfs by city", error);
  }
};

const { AcademyService } = require("../../services/academy");
const { CoachService } = require("../../services/coach");
const { TurfService } = require("../../services/turf");

// City-based search controllers
const searchAcademiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    const result = await AcademyService.searchAcademies(filters);

    return successResponse(res, "Academies fetched successfully", result);
  } catch (error) {
    console.error("Error in searchAcademiesByCity:", error);
    return errorResponse(res, error.message);
  }
};

const searchCoachesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    const result = await CoachService.searchCoaches(filters);

    return successResponse(res, "Coaches fetched successfully", result);
  } catch (error) {
    console.error("Error in searchCoachesByCity:", error);
    return errorResponse(res, error.message);
  }
};

const searchTurfsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const filters = { ...req.query, city };

    const result = await TurfService.searchTurfs(filters);

    return successResponse(res, "Turfs fetched successfully", result);
  } catch (error) {
    console.error("Error in searchTurfsByCity:", error);
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getAllAcademies,
  getAllCoaches,
  getAllTurfs,
  searchAcademiesByCity,
  searchCoachesByCity,
  searchTurfsByCity,
};
