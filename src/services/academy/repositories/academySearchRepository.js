const { AcademyProfile, Supplier, sequelize } = require("../../../database");
const { Op } = require("sequelize");

const searchAcademies = async (filters) => {
  const {
    city,
    sport,
    minRating,
    ageGroup,
    classType,
    // Removed minPrice and maxPrice as they don't exist in the model
    facilities,
    page = 1,
    limit = 20,
    latitude,
    longitude,
    radius = 5000,
    sortBy = "priority",
  } = filters;

  try {
    console.log("Starting search with filters:", filters);

    // Use direct SQL query to avoid Sequelize ORM issues with JSON fields
    let query = `
      SELECT 
        a.*,
        s.email AS "supplier.email",
        s.mobile_number AS "supplier.mobile_number",
        s.profile_picture AS "supplier.profilePicture"
      FROM 
        "AcademyProfiles" a
      LEFT JOIN 
        "Suppliers" s ON a."supplierId" = s."supplierId" AND s."deletedAt" IS NULL
      WHERE 
        a."deletedAt" IS NULL
    `;

    const countQuery = `
      SELECT 
        COUNT(DISTINCT a."academyId") as count
      FROM 
        "AcademyProfiles" a
      LEFT JOIN 
        "Suppliers" s ON a."supplierId" = s."supplierId" AND s."deletedAt" IS NULL
      WHERE 
        a."deletedAt" IS NULL
    `;

    const params = [];
    const conditions = [];

    // Add city filter
    if (city) {
      conditions.push(`a."city" ILIKE $${params.length + 1}`);
      params.push(`%${city}%`);
    }

    // Add sport filter
    if (sport) {
      conditions.push(
        `a."sports" @> ARRAY[$${params.length + 1}]::VARCHAR(255)[]`
      );
      params.push(sport);
    }

    // Add rating filter
    if (minRating) {
      conditions.push(`a."rating" >= $${params.length + 1}`);
      params.push(minRating);
    }

    // Add age group filter - using the correct JSON query syntax
    if (ageGroup) {
      // Use the ->> operator to get the value as text
      conditions.push(`(a."ageGroups"->$${params.length + 1})::text = 'true'`);
      params.push(ageGroup);
    }

    // Add class type filter - using the correct JSON query syntax
    if (classType) {
      conditions.push(`(a."classTypes"->$${params.length + 1})::text = 'true'`);
      params.push(classType);
    }

    // Add facilities filter
    if (facilities && facilities.length > 0) {
      const facilitiesArray = Array.isArray(facilities)
        ? facilities
        : facilities.split(",");
      conditions.push(
        `a."facilities" && ARRAY[$${params.length + 1}]::VARCHAR(255)[]`
      );
      params.push(facilitiesArray);
    }

    // Add location-based search if coordinates are provided
    if (latitude && longitude) {
      conditions.push(`
        ST_DWithin(
          s."location",
          ST_SetSRID(ST_MakePoint(${params.length + 1}, ${
        params.length + 2
      }), 4326),
          ${params.length + 3}
        )
      `);
      params.push(longitude, latitude, radius);
    }

    // Add conditions to queries
    if (conditions.length > 0) {
      const conditionsStr = conditions.join(" AND ");
      query += ` AND ${conditionsStr}`;
      countQuery += ` AND ${conditionsStr}`;
    }

    // Add order clause
    if (sortBy === "priority") {
      query += ` ORDER BY (a."priority"->>'value')::numeric DESC`;
    } else if (sortBy === "rating") {
      query += ` ORDER BY a."rating" DESC`;
    } else if (sortBy === "distance" && latitude && longitude) {
      query += ` ORDER BY ST_Distance(
        s."location",
        ST_SetSRID(ST_MakePoint($${params.length + 1}, $${
        params.length + 2
      }), 4326)
      ) ASC`;
      params.push(longitude, latitude);
    }

    // Always add a secondary sort by priority and then by id for consistent results
    if (sortBy !== "priority") {
      query += query.includes("ORDER BY")
        ? `, (a."priority"->>'value')::numeric DESC`
        : ` ORDER BY (a."priority"->>'value')::numeric DESC`;
    }
    query += `, a."academyId" ASC`;

    // Add pagination
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const paginationParams = [...params, limit, (page - 1) * limit];

    console.log("Count Query:", countQuery);
    console.log("Main Query:", query);
    console.log("Params:", params);

    // Execute count query
    const countResult = await sequelize.query(countQuery, {
      bind: params,
      type: sequelize.QueryTypes.SELECT,
      plain: true,
    });

    const count = Number.parseInt(countResult.count);

    // Execute main query
    const academies = await sequelize.query(query, {
      bind: paginationParams,
      type: sequelize.QueryTypes.SELECT,
      nest: true,
    });

    return {
      academies,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error in searchAcademies repository:", error);
    throw error;
  }
};

module.exports = {
  searchAcademies,
};
