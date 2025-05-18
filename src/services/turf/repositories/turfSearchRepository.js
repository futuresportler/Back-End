const { TurfProfile, Supplier, sequelize } = require("../../../database");
const { Op } = require("sequelize");

const searchTurfs = async (filters) => {
  const {
    city,
    sport,
    minRating,
    turfType,
    minPrice,
    maxPrice,
    facilities,
    page = 1,
    limit = 20,
    latitude,
    longitude,
    radius = 5000,
    sortBy = "priority",
  } = filters;

  try {
    // Build where clause
    let whereClause =
      '"TurfProfile"."deletedAt" IS NULL AND "TurfProfile"."status" = \'active\'';
    const replacements = {};

    // Add city filter
    if (city) {
      whereClause += ` AND "TurfProfile"."city" ILIKE :city`;
      replacements.city = `%${city}%`;
    }

    // Add sport filter
    if (sport) {
      whereClause += ` AND "TurfProfile"."sportsAvailable" @> ARRAY[:sport]::VARCHAR(255)[]`;
      replacements.sport = sport;
    }

    // Add rating filter
    if (minRating) {
      whereClause += ` AND "TurfProfile"."rating" >= :minRating`;
      replacements.minRating = minRating;
    }

    // Add turf type filter - ensure lowercase
    if (turfType) {
      whereClause += ` AND "TurfProfile"."turfType" = :turfType`;
      replacements.turfType = turfType.toLowerCase();
    }

    // Add facilities filter
    if (facilities) {
      const facilitiesArray = Array.isArray(facilities)
        ? facilities
        : facilities.split(",");
      whereClause += ` AND "TurfProfile"."facilities" && ARRAY[:facilities]::VARCHAR(255)[]`;
      replacements.facilities = facilitiesArray;
    }

    // Add price range filters
    if (minPrice) {
      whereClause += ` AND "TurfProfile"."hourlyRate" >= :minPrice`;
      replacements.minPrice = minPrice;
    }

    if (maxPrice) {
      whereClause += ` AND "TurfProfile"."hourlyRate" <= :maxPrice`;
      replacements.maxPrice = maxPrice;
    }

    // Build location-based search if coordinates are provided
    let joinClause = `LEFT OUTER JOIN "Suppliers" AS "supplier" ON "TurfProfile"."supplierId" = "supplier"."supplierId" AND ("supplier"."deletedAt" IS NULL)`;

    if (latitude && longitude) {
      joinClause += ` AND ST_DWithin(
        "supplier"."location",
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
        :radius
      )`;
      replacements.latitude = latitude;
      replacements.longitude = longitude;
      replacements.radius = radius;
    }

    // Determine order based on sortBy parameter
    let orderClause = "";

    if (sortBy === "priority") {
      orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC`;
    } else if (sortBy === "rating") {
      orderClause = `ORDER BY "TurfProfile"."rating" DESC`;
    } else if (sortBy === "price") {
      orderClause = `ORDER BY "TurfProfile"."hourlyRate" ASC`;
    } else if (sortBy === "distance" && latitude && longitude) {
      orderClause = `ORDER BY ST_Distance(
        "supplier"."location",
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
      ) ASC`;
    }

    // Always add a secondary sort by priority and then by id for consistent results
    if (sortBy !== "priority") {
      orderClause += orderClause
        ? `, ("TurfProfile"."priority"->>'value')::numeric DESC`
        : `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC`;
    }
    orderClause += `, "TurfProfile"."turfId" ASC`;

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build the count query
    const countQuery = `
      SELECT COUNT(DISTINCT("TurfProfile"."turfId")) as count
      FROM "TurfProfiles" AS "TurfProfile"
      ${joinClause}
      WHERE ${whereClause}
    `;

    // Execute count query
    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = Number.parseInt(countResult.count);

    // Build the main query
    const query = `
      SELECT 
        "TurfProfile".*,
        "supplier"."email" AS "supplier.email",
        "supplier"."mobile_number" AS "supplier.mobile_number",
        "supplier"."profilePicture" AS "supplier.profilePicture"
      FROM "TurfProfiles" AS "TurfProfile"
      ${joinClause}
      WHERE ${whereClause}
      ${orderClause}
      LIMIT :limit OFFSET :offset
    `;

    // Add pagination parameters
    replacements.limit = Number.parseInt(limit);
    replacements.offset = Number.parseInt(offset);

    // Execute main query
    const turfs = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
      nest: true,
    });

    return {
      turfs,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error in searchTurfs:", error);
    throw error;
  }
};

module.exports = {
  searchTurfs,
};
