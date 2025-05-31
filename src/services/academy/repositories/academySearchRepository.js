const { AcademyProfile, Supplier, sequelize } = require("../../../database");
const { Op } = require("sequelize");

const searchAcademies = async (filters) => {
  const {
    city,
    sport,
    minRating,
    maxFee,
    page = 1,
    limit = 20,
    latitude,
    longitude,
    radius = 5000,
    sortBy = "priority",
    searchTerm
  } = filters;

  try {
    // Base query for academies
    let baseQuery = `
      SELECT 
        a."academyId",
        a."name",
        a."description", 
        a."sports",
        a."facilities",
        a."photos",
        a."videos",
        a."operatingHours",
        a."ageGroups",       
        a."classTypes",      
        a."location",         
        a."city",             
        a."address",          
        a."phone",            
        a."email",            
        a."website",          
        a."socialMediaLinks", 
        a."rating",
        a."reviewsCount",
        a."totalStudents",
        a."totalPrograms",
        a."foundedYear",
        a."trailDuration",    
        a."trailBookable",    
        a."cctv",             
        a."isVerified",
        a."achievements",
        a."priority",
        (a."priority"->>'value')::numeric as "priorityValue",
        s."name" as "supplierName",
        s."email" as "supplierEmail",
        s."mobile_number" as "supplierMobile",
        s."city" as "supplierCity",
        s."state" as "supplierState",
        s."location" as "supplierLocation"${latitude && longitude && sortBy === "distance" ? `,
        ST_Distance(
          s."location",
          ST_SetSRID(ST_MakePoint($LONGITUDE_PLACEHOLDER$, $LATITUDE_PLACEHOLDER$), 4326)
        ) as "distance"` : ''}
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
      conditions.push(`s."city" ILIKE $${params.length + 1}`);
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

    // Add fee filter
    if (maxFee) {
      conditions.push(`(a."feeStructure"->>'monthly')::numeric <= $${params.length + 1}`);
      params.push(maxFee);
    }

    // Add search term filter
    if (searchTerm) {
      conditions.push(`(
        a."name" ILIKE $${params.length + 1} OR 
        a."description" ILIKE $${params.length + 1}
      )`);
      params.push(`%${searchTerm}%`);
    }

    // Add distance filter
    if (latitude && longitude && radius) {
      conditions.push(`
        ST_DWithin(
          s."location",
          ST_SetSRID(ST_MakePoint($${params.length + 1}, $${params.length + 2}), 4326),
          $${params.length + 3}
        )
      `);
      params.push(longitude, latitude, radius);
    }

    // Add conditions to queries
    if (conditions.length > 0) {
      const whereClause = ` AND ${conditions.join(" AND ")}`;
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    // Add ORDER BY clause with priority first
    let orderClause = `ORDER BY (a."priority"->>'value')::numeric DESC`;

    if (sortBy === "priority") {
      // Priority is already first
    } else if (sortBy === "rating") {
      orderClause += `, a."rating" DESC`;
    } else if (sortBy === "name") {
      orderClause += `, a."name" ASC`;
    } else if (sortBy === "distance" && latitude && longitude) {
      orderClause += `, ST_Distance(
        s."location",
        ST_SetSRID(ST_MakePoint($${params.length + 1}, $${params.length + 2}), 4326)
      ) ASC`;
      params.push(longitude, latitude);
    }

    // Always add academy ID for consistent ordering
    orderClause += `, a."academyId" ASC`;

    // Add pagination
    const offset = (page - 1) * limit;
    baseQuery += ` ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    // Execute queries
    const [academies, countResult] = await Promise.all([
      sequelize.query(baseQuery, {
        bind: params,
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(countQuery, {
        bind: params.slice(0, -2), // Remove limit and offset for count
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    const total = parseInt(countResult[0].count);

    return {
      academies: academies.map(academy => ({
        ...academy,
        promotionStatus: {
          isPromoted: academy.priority?.value > 0,
          plan: academy.priority?.plan || "none",
          expiresAt: academy.priority?.expiresAt
        }
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error("Error in searchAcademies:", error);
    throw error;
  }
};

module.exports = {
  searchAcademies,
};