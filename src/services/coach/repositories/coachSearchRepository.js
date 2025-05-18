const { CoachProfile, Supplier, sequelize } = require("../../../database");
const { Op } = require("sequelize");

const searchCoaches = async (filters) => {
  const {
    city,
    sport,
    minRating,
    ageGroup,
    classType,
    minPrice,
    maxPrice,
    minExperience,
    page = 1,
    limit = 20,
    latitude,
    longitude,
    radius = 5000,
    sortBy = "priority",
  } = filters;

  try {
    // Build where clause
    const where = {};

    // Add status filter - only show active coaches
    where.status = "active";

    // Add city filter
    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    // Add sport filter
    if (sport) {
      where.sportsCoached = { [Op.contains]: [sport] };
    }

    // Add rating filter
    if (minRating) {
      where.rating = { [Op.gte]: minRating };
    }

    // Add age group filter - FIX: Use proper JSON query syntax
    if (ageGroup) {
      // Use sequelize.where and sequelize.fn to create a proper condition
      where[Op.and] = sequelize.where(
        sequelize.fn(
          "json_extract_path_text",
          sequelize.col("CoachProfile.ageGroups"),
          ageGroup
        ),
        "true"
      );
    }

    // Add class type filter - FIX: Use proper JSON query syntax
    if (classType) {
      const classTypeCondition = sequelize.where(
        sequelize.fn(
          "json_extract_path_text",
          sequelize.col("CoachProfile.classType"),
          classType
        ),
        "true"
      );

      if (where[Op.and]) {
        // If we already have an AND condition, add this as another AND
        where[Op.and] = { [Op.and]: [where[Op.and], classTypeCondition] };
      } else {
        where[Op.and] = classTypeCondition;
      }
    }

    // Add price range filters
    if (minPrice) {
      where.hourlyRate = { ...where.hourlyRate, [Op.gte]: minPrice };
    }

    if (maxPrice) {
      where.hourlyRate = { ...where.hourlyRate, [Op.lte]: maxPrice };
    }

    // Add experience filter
    if (minExperience) {
      where.experienceYears = { [Op.gte]: minExperience };
    }

    // Build include for supplier (needed for location-based search)
    const include = [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture"],
      },
    ];

    // Add location-based search if coordinates are provided
    if (latitude && longitude) {
      include[0].where = sequelize.where(
        sequelize.fn(
          "ST_DWithin",
          sequelize.col("supplier.location"),
          sequelize.fn(
            "ST_SetSRID",
            sequelize.fn("ST_MakePoint", longitude, latitude),
            4326
          ),
          radius
        ),
        true
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Determine order based on sortBy parameter
    const order = [];

    if (sortBy === "priority") {
      order.push([sequelize.json("priority.value"), "DESC"]);
    } else if (sortBy === "rating") {
      order.push(["rating", "DESC"]);
    } else if (sortBy === "experience") {
      order.push(["experienceYears", "DESC"]);
    } else if (sortBy === "price") {
      order.push(["hourlyRate", "ASC"]);
    } else if (sortBy === "distance" && latitude && longitude) {
      order.push([
        sequelize.literal(`ST_Distance(
          "supplier"."location", 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        )`),
        "ASC",
      ]);
    }

    // Always add a secondary sort by priority and then by id for consistent results
    if (sortBy !== "priority") {
      order.push([sequelize.json("priority.value"), "DESC"]);
    }
    order.push(["coachId", "ASC"]);

    // Execute query
    const { count, rows } = await CoachProfile.findAndCountAll({
      where,
      include,
      order,
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      distinct: true,
    });

    return {
      coaches: rows,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error in searchCoaches:", error);
    throw error;
  }
};

module.exports = {
  searchCoaches,
};
