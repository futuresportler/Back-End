const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller");

// City-based search routes
router.get("/:city/academies", searchController.searchAcademiesByCity);
router.get("/:city/coaches", searchController.searchCoachesByCity);
router.get("/:city/turfs", searchController.searchTurfsByCity);

module.exports = router;
