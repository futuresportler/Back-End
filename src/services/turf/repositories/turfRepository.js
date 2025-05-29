const {
  TurfProfile,
  Supplier,
  sequelize,
  TurfReview,
  User,
  TurfSlot,
  SlotRequest,
  TurfGround,
  Day,
} = require("../../../database")
const { Op } = require("sequelize")




const findTurfsNearby = async (latitude, longitude, radius) => {
  return await TurfProfile.findAll({
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn("ST_SetSRID", sequelize.fn("ST_MakePoint", longitude, latitude), 4326),
            radius,
          ),
          true,
        ),
      },
    ],
  })
}

const getTurfQuickInfo = async (turfId) => {
  // Get total bookings, revenue, utilization, etc.
  const totalBookings = await TurfSlot.count({
    where: { turfId, status: "booked" },
  })

  const totalRevenue = await TurfSlot.sum("price", {
    where: { turfId, status: "booked", paymentStatus: "confirmed" },
  })

  // Calculate utilization (booked slots / total slots)
  const totalSlots = await TurfSlot.count({ where: { turfId } })
  const utilization = totalSlots > 0 ? (totalBookings / totalSlots) * 100 : 0

  return {
    totalBookings,
    totalRevenue: totalRevenue || 0,
    utilization: Math.round(utilization),
  }
}

const getUpcomingBookings = async (turfId, limit = 5) => {
  const today = new Date()

  return await TurfSlot.findAll({
    where: {
      turfId,
      status: "booked",
      date: { [Op.gte]: today.toISOString().split("T")[0] },
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
      },
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
    ],
    order: [
      ["date", "ASC"],
      ["startTime", "ASC"],
    ],
    limit,
  })
}

const getTodaySchedule = async (turfId) => {
  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0]

  return await TurfSlot.findAll({
    where: {
      turfId,
      date: formattedDate,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name"],
      },
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
      },
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
    ],
    order: [["startTime", "ASC"]],
  })
}

const getBookingRequests = async (turfId, limit = 5) => {
  return await SlotRequest.findAll({
    where: {
      turfId,
      status: "pending",
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "email", "profilePicture"],
      },
      {
        model: TurfGround,
        as: "ground",
        attributes: ["name", "sportType"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  })
}

const getCustomerReviews = async (turfId, limit = 5) => {
  return await TurfReview.findAll({
    where: { turfId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["name", "profilePicture"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
  })
}

const updateBookingRequestStatus = async (requestId, status) => {
  const request = await SlotRequest.findByPk(requestId)
  if (!request) return null
  return await request.update({ status })
}

const addTurfReview = async (reviewData) => {
  const review = await TurfReview.create(reviewData)

  // Update turf rating
  const turf = await TurfProfile.findByPk(reviewData.turfId)
  const reviews = await TurfReview.findAll({ where: { turfId: reviewData.turfId } })

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length

  await turf.update({
    rating: averageRating,
    totalReviews: reviews.length,
  })

  return review
}

// Ground-related repository methods
const createTurfGround = async (groundData) => {
  return await TurfGround.create(groundData)
}

const findGroundsByTurfId = async (turfId) => {
  return await TurfGround.findAll({
    where: { turfId },
    include: [
      {
        model: TurfProfile,
        as: "turfProfile",
        attributes: ["name"],
      },
    ],
  })
}

const findGroundById = async (groundId) => {
  return await TurfGround.findByPk(groundId, {
    include: [
      {
        model: TurfProfile,
        as: "turfProfile",
        attributes: ["name", "openingTime", "closingTime"],
      },
    ],
  })
}

const updateTurfGround = async (groundId, updateData) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  return await ground.update(updateData)
}

const deleteTurfGround = async (groundId) => {
  const ground = await TurfGround.findByPk(groundId)
  if (!ground) return null
  await ground.destroy()
  return ground
}

// Slot-related repository methods
const findSlotsByGroundAndDate = async (groundId, date) => {
  return await TurfSlot.findAll({
    where: {
      groundId,
      date,
    },
    include: [
      {
        model: Day,
        as: "day",
        attributes: ["name"],
      },
    ],
    order: [["startTime", "ASC"]],
  })
}

const findTurfProfileById = async (turfProfileId) => {
  return await TurfProfile.findByPk(turfProfileId, {
    attributes: [
      "turfId",
      "name",
      "description",
      "sports",
      "facilities",
      "images",
      "hourlyRate",
      "contactInfo",
      "rating",
      "reviews",
      "openingHours",
      "courtCount",
      "surfaceType",
      "lighting",
      "parking",
      "amenities",
      "cancellationPolicy",
      "priority", // Add priority field
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
  });
};

const findAllTurfProfiles = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "priority", // Default to priority sorting
    city,
    state,
    sport,
    minRating,
    maxRate,
    latitude,
    longitude,
    radius = 50,
    searchTerm,
    surfaceType,
    hasParking,
    hasLighting,
  } = filters;

  const offset = (page - 1) * limit;
  
  // Build where clauses
  const whereConditions = [];
  const supplierWhereConditions = [];

  if (city) {
    supplierWhereConditions.push(`"supplier"."city" ILIKE '%${city}%'`);
  }

  if (state) {
    supplierWhereConditions.push(`"supplier"."state" ILIKE '%${state}%'`);
  }

  if (sport) {
    whereConditions.push(`"TurfProfile"."sports" @> '["${sport}"]'`);
  }

  if (minRating) {
    whereConditions.push(`"TurfProfile"."rating" >= ${parseFloat(minRating)}`);
  }

  if (maxRate) {
    whereConditions.push(`"TurfProfile"."hourlyRate" <= ${parseInt(maxRate)}`);
  }

  if (surfaceType) {
    whereConditions.push(`"TurfProfile"."surfaceType" = '${surfaceType}'`);
  }

  if (hasParking === 'true') {
    whereConditions.push(`"TurfProfile"."parking" = true`);
  }

  if (hasLighting === 'true') {
    whereConditions.push(`"TurfProfile"."lighting" = true`);
  }

  if (searchTerm) {
    whereConditions.push(`(
      "TurfProfile"."name" ILIKE '%${searchTerm}%' OR 
      "TurfProfile"."description" ILIKE '%${searchTerm}%' OR
      "TurfProfile"."sports"::text ILIKE '%${searchTerm}%'
    )`);
  }

  // Distance filter
  if (latitude && longitude && radius) {
    supplierWhereConditions.push(`
      ST_DWithin(
        "supplier"."location",
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        ${radius * 1000}
      )
    `);
  }

  // Build WHERE clause
  let whereClause = "";
  if (whereConditions.length > 0 || supplierWhereConditions.length > 0) {
    const allConditions = [...whereConditions, ...supplierWhereConditions];
    whereClause = `WHERE ${allConditions.join(" AND ")}`;
  }

  // Build ORDER clause - ALWAYS prioritize promoted content first
  let orderClause = "";
  
  if (sortBy === "priority") {
    orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC`;
  } else if (sortBy === "rating") {
    orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC, "TurfProfile"."rating" DESC`;
  } else if (sortBy === "price") {
    orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC, "TurfProfile"."hourlyRate" ASC`;
  } else if (sortBy === "distance" && latitude && longitude) {
    orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC, ST_Distance(
      "supplier"."location",
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
    ) ASC`;
  } else {
    // Default: Priority first, then by rating
    orderClause = `ORDER BY ("TurfProfile"."priority"->>'value')::numeric DESC, "TurfProfile"."rating" DESC`;
  }
  
  // Always add turfId as final sort for consistency
  orderClause += `, "TurfProfile"."turfId" ASC`;

  // Build the complete query
  const query = `
    SELECT 
      "TurfProfile"."turfId",
      "TurfProfile"."name",
      "TurfProfile"."description",
      "TurfProfile"."sports",
      "TurfProfile"."facilities",
      "TurfProfile"."images",
      "TurfProfile"."hourlyRate",
      "TurfProfile"."rating",
      "TurfProfile"."reviews",
      "TurfProfile"."courtCount",
      "TurfProfile"."surfaceType",
      "TurfProfile"."lighting",
      "TurfProfile"."parking",
      "TurfProfile"."priority",
      "supplier"."supplierId",
      "supplier"."name" as "supplierName",
      "supplier"."email",
      "supplier"."mobile_number",
      "supplier"."profilePicture",
      "supplier"."address",
      "supplier"."city",
      "supplier"."state",
      "supplier"."pincode",
      ST_AsGeoJSON("supplier"."location") as "location"
      ${latitude && longitude ? `, ST_Distance(
        "supplier"."location",
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
      ) as "distance"` : ''}
    FROM "turf_profiles" as "TurfProfile"
    INNER JOIN "suppliers" as "supplier" ON "TurfProfile"."supplierId" = "supplier"."supplierId"
    ${whereClause}
    ${orderClause}
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM "turf_profiles" as "TurfProfile"
    INNER JOIN "suppliers" as "supplier" ON "TurfProfile"."supplierId" = "supplier"."supplierId"
    ${whereClause}
  `;

  const replacements = {
    limit: parseInt(limit),
    offset: parseInt(offset),
    ...(latitude && longitude && { longitude: parseFloat(longitude), latitude: parseFloat(latitude) })
  };

  const [turfs, countResult] = await Promise.all([
    sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    }),
    sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })
  ]);

  const totalCount = parseInt(countResult[0].count);

  return {
    turfs: turfs.map(turf => ({
      ...turf,
      supplier: {
        supplierId: turf.supplierId,
        name: turf.supplierName,
        email: turf.email,
        mobile_number: turf.mobile_number,
        profilePicture: turf.profilePicture,
        address: turf.address,
        city: turf.city,
        state: turf.state,
        pincode: turf.pincode,
        location: turf.location ? JSON.parse(turf.location) : null
      },
      distance: turf.distance || null
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: parseInt(limit)
    }
  };
};

const createTurfProfile = async (turfData) => {
  const defaultPriority = { value: 0, plan: "none", expiresAt: null };
  
  return await TurfProfile.create({
    ...turfData,
    priority: defaultPriority
  });
};

const updateTurfProfile = async (turfId, updateData) => {
  const turf = await TurfProfile.findByPk(turfId);
  if (!turf) {
    throw new Error("Turf profile not found");
  }

  return await turf.update(updateData);
};

const deleteTurfProfile = async (turfId) => {
  const turf = await TurfProfile.findByPk(turfId);
  if (!turf) {
    throw new Error("Turf profile not found");
  }

  await turf.destroy();
  return { message: "Turf profile deleted successfully" };
};

const findTurfsBySupplierId = async (supplierId) => {
  return await TurfProfile.findAll({
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: { supplierId },
        attributes: ["supplierId", "name", "email", "city", "state"]
      }
    ],
    order: [
      [sequelize.json("priority.value"), "DESC"], // Prioritize promoted turfs
      ["createdAt", "DESC"]
    ]
  });
};

const findTurfsBySport = async (sport, filters = {}) => {
  const { limit = 10, latitude, longitude } = filters;
  
  const order = [
    [sequelize.json("priority.value"), "DESC"], // Always prioritize promoted content
    ["rating", "DESC"],
    ["turfId", "ASC"]
  ];

  if (latitude && longitude) {
    order.splice(2, 0, [
      sequelize.literal(`ST_Distance(
        "supplier"."location", 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )`),
      "ASC"
    ]);
  }

  return await TurfProfile.findAll({
    where: {
      sports: { [Op.contains]: [sport] }
    },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "city", "state", "location"]
      }
    ],
    order,
    limit: parseInt(limit)
  });
};

const getTopRatedTurfs = async (limit = 10) => {
  return await TurfProfile.findAll({
    where: {
      rating: { [Op.gte]: 4.0 }
    },
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name", "city", "state"]
      }
    ],
    order: [
      [sequelize.json("priority.value"), "DESC"], // Prioritize promoted content
      ["rating", "DESC"],
      ["reviews", "DESC"],
      ["turfId", "ASC"]
    ],
    limit: parseInt(limit)
  });
};

const findAvailableTurfs = async (date, timeSlot, filters = {}) => {
  const { sport, city, latitude, longitude } = filters;
  
  let whereClause = {};
  let supplierWhereClause = {};

  if (sport) {
    whereClause.sports = { [Op.contains]: [sport] };
  }

  if (city) {
    supplierWhereClause.city = { [Op.iLike]: `%${city}%` };
  }

  const order = [
    [sequelize.json("priority.value"), "DESC"], // Always prioritize promoted content
    ["rating", "DESC"]
  ];

  if (latitude && longitude) {
    order.push([
      sequelize.literal(`ST_Distance(
        "supplier"."location", 
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )`),
      "ASC"
    ]);
  }

  order.push(["turfId", "ASC"]);

  // Find turfs that don't have bookings for the specified date and time
  const availableTurfs = await TurfProfile.findAll({
    where: {
      ...whereClause,
      turfId: {
        [Op.notIn]: sequelize.literal(`(
          SELECT DISTINCT "turfId" 
          FROM "turf_slots" 
          WHERE "date" = '${date}' 
          AND "timeSlot" = '${timeSlot}' 
          AND "status" IN ('booked', 'blocked')
        )`)
      }
    },
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: supplierWhereClause,
        attributes: ["name", "city", "state", "location", "mobile_number"]
      }
    ],
    order
  });

  return availableTurfs;
};

const getTurfAnalytics = async (turfId) => {
  const turf = await TurfProfile.findByPk(turfId, {
    attributes: [
      "turfId",
      "name",
      "rating", 
      "reviews",
      "hourlyRate",
      "priority"
    ]
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  // Get booking analytics for the turf
  const bookingStats = await sequelize.query(
    `SELECT 
      COUNT(*) as total_bookings,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
      AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_booking_amount
     FROM turf_slots 
     WHERE "turfId" = :turfId 
     AND created_at >= NOW() - INTERVAL '30 days'`,
    {
      replacements: { turfId },
      type: sequelize.QueryTypes.SELECT
    }
  );

  return {
    turf: turf.toJSON(),
    promotionStatus: {
      isPromoted: turf.priority?.value > 0,
      plan: turf.priority?.plan || "none", 
      expiresAt: turf.priority?.expiresAt
    },
    bookingStats: bookingStats[0] || { total_bookings: 0, completed_bookings: 0, avg_booking_amount: 0 }
  };
};
// Add this method to the existing file

const getTurfWithPromotionStatus = async (turfProfileId) => {
  const turf = await TurfProfile.findByPk(turfProfileId, {
    attributes: [
      "turfId",
      "name",
      "description",
      "sports",
      "facilities",
      "images",
      "hourlyRate",
      "contactInfo",
      "rating",
      "reviews",
      "openingHours",
      "courtCount",
      "surfaceType",
      "lighting",
      "parking",
      "amenities",
      "cancellationPolicy",
      "priority", // Already present
    ],
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
  });

  if (!turf) {
    throw new Error("Turf not found");
  }

  return {
    ...turf.toJSON(),
    promotionStatus: {
      isPromoted: turf.priority?.value > 0,
      plan: turf.priority?.plan || "none", 
      expiresAt: turf.priority?.expiresAt
    }
  };
};

module.exports = {
  findTurfProfileById,
  findTurfsBySupplierId,
  createTurfProfile,
  updateTurfProfile,
  deleteTurfProfile,
  findTurfsNearby,
  getTurfQuickInfo,
  getUpcomingBookings,
  getTodaySchedule,
  getBookingRequests,
  getCustomerReviews,
  updateBookingRequestStatus,
  addTurfReview,

  getTurfWithPromotionStatus,

  findAllTurfProfiles,
  findTurfsBySport,
  getTopRatedTurfs,
  findAvailableTurfs,
  getTurfAnalytics,
  // Ground-related methods
  createTurfGround,
  findGroundsByTurfId,
  findGroundById,
  updateTurfGround,
  deleteTurfGround,
  // Slot-related methods
  findSlotsByGroundAndDate,
}
