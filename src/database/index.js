const { sequelize, connectPostgres, connectMongoDB } = require("../config/database")
const { DataTypes } = require("sequelize")
const coachMetric = require("./models/postgres/coach/coachMetric")

// Import models
const Day = require("./models/postgres/day")(sequelize)
const Month = require("./models/postgres/month")(sequelize)
const Year = require("./models/postgres/year")(sequelize)

const User = require("./models/postgres/user")(sequelize)
const Supplier = require("./models/postgres/supplier")(sequelize)

const CoachProfile = require("./models/postgres/coach/coachProfile")(sequelize)
const CoachSlot = require("./models/postgres/coach/coachSlot")(sequelize)
const CoachPayment = require("./models/postgres/coach/coachPayment")(sequelize)
const CoachReview = require("./models/postgres/coach/coachReview")(sequelize)
const CoachMetric = require("./models/postgres/coach/coachMetric")(sequelize)
const CoachStudent = require("./models/postgres/coach/coachStudent")(sequelize)
const MonthlyCoachMetric = require("./models/postgres/coach/monthlyCoachMetric")(sequelize)
const MonthlyStudentProgress = require("./models/postgres/coach/monthlyStudentProgress")(sequelize)

const AcademyProfile = require("./models/postgres/academy/academyProfile")(sequelize)
const AcademyBatch = require("./models/postgres/academy/academyBatch")(sequelize)
const AcademyProgram = require("./models/postgres/academy/academyProgram")(sequelize)
const AcademyMetric = require("./models/postgres/academy/academyMetric")(sequelize)
const AcademyAttendance = require("./models/postgres/academy/academyAttendance")(sequelize)
const AcademyCoach = require("./models/postgres/academy/academyCoach")(sequelize)
const AcademyStudent = require("./models/postgres/academy/academyStudent")(sequelize)
const AcademyFee = require("./models/postgres/academy/academyFee")(sequelize)
const MonthlyStudentMetric = require("./models/postgres/academy/monthlyStudentMetric")(sequelize)

const TurfProfile = require("./models/postgres/turf/turfProfile")(sequelize)
const TurfGround = require("./models/postgres/turf/turfGround")(sequelize)
const TurfSlot = require("./models/postgres/turf/turfSlot")(sequelize)
const TurfReview = require("./models/postgres/turf/turfReview")(sequelize)
const TurfPayment = require("./models/postgres/turf/turfPayment")(sequelize)
const SlotRequest = require("./models/postgres/turf/slotRequest")(sequelize)
const TurfMetric = require("./models/postgres/turf/turfMetric")(sequelize)

// Define Associations
const defineAssociations = () => {
  // Supplier -> Profile Relationships (One-to-One for Coach)
  Supplier.hasOne(CoachProfile, {
    foreignKey: "supplierId",
    as: "coachProfile",
  })
  CoachProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  })

  // One-to-Many for Academy and Turf
  Supplier.hasMany(AcademyProfile, {
    foreignKey: "supplierId",
    as: "academyProfiles",
  })
  AcademyProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  })
  Supplier.hasMany(TurfProfile, {
    foreignKey: "supplierId",
    as: "turfProfiles",
  })
  TurfProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  })

  // Time Hierarchy Relationships
  Year.hasMany(Month, {
    foreignKey: "yearId",
    as: "months",
  })
  Month.belongsTo(Year, {
    foreignKey: "yearId",
    as: "year",
  })

  Month.hasMany(Day, {
    foreignKey: "monthId",
    as: "days",
  })
  Day.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  })

  // Link Metrics to Time Structure
  Day.hasMany(AcademyMetric, {
    foreignKey: "dayId",
    as: "academyMetrics",
  })
  Day.hasMany(TurfMetric, {
    foreignKey: "dayId",
    as: "turfMetrics",
  })
  Day.hasMany(CoachMetric, {
    foreignKey: "dayId",
    as: "coachMetrics",
  })

  Month.hasMany(AcademyMetric, {
    foreignKey: "monthId",
    as: "academyMetrics",
  })
  Month.hasMany(TurfMetric, {
    foreignKey: "monthId",
    as: "turfMetrics",
  })
  Month.hasMany(CoachMetric, {
    foreignKey: "monthId",
    as: "coachMetrics",
  })
  Month.hasMany(MonthlyCoachMetric, {
    foreignKey: "monthId",
    as: "monthlyCoachMetrics",
  })
  Month.hasMany(MonthlyStudentProgress, {
    foreignKey: "monthId",
    as: "monthlyStudentProgress",
  })

  // AcademyProfile Associations
  AcademyProfile.hasMany(AcademyBatch, { foreignKey: "academyId" })
  AcademyProfile.hasMany(AcademyProgram, { foreignKey: "academyId" })
  AcademyProfile.hasMany(AcademyMetric, { foreignKey: "academyId" })
  AcademyProfile.hasMany(AcademyFee, { foreignKey: "academyId" })
  AcademyProfile.hasMany(AcademyCoach, { foreignKey: "academyId" })
  AcademyProfile.hasMany(AcademyStudent, { foreignKey: "academyId" })

  // Program Relationships
  AcademyProgram.hasMany(AcademyFee, { foreignKey: "programId" })

  AcademyStudent.belongsTo(AcademyProgram, {
    foreignKey: "programId",
    as: "program",
    allowNull: true, // This makes the relationship optional
  })

  AcademyProgram.hasMany(AcademyStudent, {
    foreignKey: "programId",
    as: "students",
  })

  // Batch Relationships
  AcademyBatch.hasMany(AcademyFee, { foreignKey: "batchId" })

  AcademyStudent.belongsTo(AcademyBatch, {
    foreignKey: "batchId",
    as: "batch",
    allowNull: true, // This makes the relationship optional
  })

  AcademyBatch.hasMany(AcademyStudent, {
    foreignKey: "batchId",
    as: "students",
  })

  // Fee Relationships
  AcademyFee.belongsTo(AcademyProfile, { foreignKey: "academyId" })
  AcademyFee.belongsTo(AcademyProgram, { foreignKey: "programId" })
  AcademyFee.belongsTo(AcademyBatch, { foreignKey: "batchId" })
  AcademyFee.belongsTo(User, { foreignKey: "studentId" })

  MonthlyStudentMetric.belongsTo(AcademyStudent, {
    foreignKey: "studentId",
  })

  MonthlyStudentMetric.belongsTo(AcademyProgram, {
    foreignKey: "programId",
  })

  MonthlyStudentMetric.belongsTo(AcademyBatch, {
    foreignKey: "batchId",
  })

  MonthlyStudentMetric.belongsTo(Month, {
    foreignKey: "monthId",
  })

  AcademyStudent.hasMany(MonthlyStudentMetric, {
    foreignKey: "studentId",
  })

  // Attendance Relationships
  AcademyAttendance.belongsTo(Day, { foreignKey: "dayId" })
  AcademyAttendance.belongsTo(AcademyProgram, { foreignKey: "programId" })
  AcademyAttendance.belongsTo(User, { foreignKey: "studentId" })

  // Metric Relationships
  AcademyMetric.belongsTo(Day, { foreignKey: "dayId" })
  AcademyMetric.belongsTo(Month, { foreignKey: "monthId" })

  // TurfProfile Associations
  TurfProfile.hasMany(TurfGround, {
    foreignKey: "turfId",
    as: "grounds",
  })
  TurfGround.belongsTo(TurfProfile, {
    foreignKey: "turfId",
    as: "turf",
  })

  // Ground Relationships
  TurfGround.hasMany(TurfSlot, {
    foreignKey: "groundId",
    as: "slots",
  })
  TurfSlot.belongsTo(TurfGround, {
    foreignKey: "groundId",
    as: "ground",
  })

  TurfGround.hasMany(TurfReview, {
    foreignKey: "groundId",
    as: "reviews",
  })
  TurfReview.belongsTo(TurfGround, {
    foreignKey: "groundId",
    as: "ground",
  })

  // Slot Relationships
  TurfSlot.belongsTo(Day, {
    foreignKey: "dayId",
  })
  TurfSlot.hasMany(SlotRequest, {
    foreignKey: "slotId",
    as: "requests",
  })

  // Payment Relationships
  TurfPayment.belongsTo(SlotRequest, {
    foreignKey: "requestId",
  })
  TurfPayment.belongsTo(User, {
    foreignKey: "userId",
  })

  // Review Validation
  TurfReview.belongsTo(User, {
    foreignKey: "userId",
  })
  TurfReview.belongsTo(TurfPayment, {
    foreignKey: "paymentId",
    constraints: false, // For optional relationship
  })

  // Metric Relationships
  TurfMetric.belongsTo(Day, { foreignKey: "dayId" })
  TurfMetric.belongsTo(Month, { foreignKey: "monthId" })

  // CoachProfile Associations
  CoachProfile.hasMany(CoachSlot, {
    foreignKey: "coachId",
    as: "slots",
  })
  CoachProfile.hasMany(CoachPayment, {
    foreignKey: "coachId",
  })
  CoachProfile.hasMany(CoachMetric, {
    foreignKey: "coachId",
  })
  CoachProfile.hasMany(CoachReview, {
    foreignKey: "coachId",
  })
  CoachProfile.hasMany(MonthlyCoachMetric, {
    foreignKey: "coachId",
    as: "monthlyMetrics",
  })

  // Monthly Coach Metrics
  MonthlyCoachMetric.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  })
  MonthlyCoachMetric.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  })

  // Monthly Student Progress
  MonthlyStudentProgress.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  })
  MonthlyStudentProgress.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  })
  MonthlyStudentProgress.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  })

  CoachProfile.hasMany(MonthlyStudentProgress, {
    foreignKey: "coachId",
    as: "studentProgress",
  })

  User.hasMany(MonthlyStudentProgress, {
    foreignKey: "userId",
    as: "progressReports",
  })

  // Student Relationships
  CoachProfile.belongsToMany(User, {
    through: CoachStudent,
    foreignKey: "coachId",
    otherKey: "userId",
    as: "students",
  })

  User.belongsToMany(CoachProfile, {
    through: CoachStudent,
    foreignKey: "userId",
    otherKey: "coachId",
    as: "coaches",
  })

  // Slot Relationships
  CoachSlot.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  })

  CoachSlot.belongsTo(Day, {
    foreignKey: "dayId",
    as: "day",
  })

  CoachSlot.hasMany(CoachPayment, {
    foreignKey: "slotId",
    as: "payments",
  })

  // Review Validation
  CoachReview.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  })

  CoachReview.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  })

  CoachReview.belongsTo(CoachPayment, {
    foreignKey: "paymentId",
    constraints: false,
    as: "payment",
  })

  CoachMetric.belongsTo(Day, { foreignKey: "dayId" })
  CoachMetric.belongsTo(Month, { foreignKey: "monthId" })
  CoachMetric.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  })
}

// Database Sync Function
const syncDatabase = async () => {
  try {
    await sequelize.authenticate()

    // Try to create PostGIS extension, but continue if it fails
    try {
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis")
      console.log("✅ PostGIS extension enabled")
    } catch (error) {
      console.warn("⚠️ PostGIS extension not available. Spatial features will be limited.")
      console.warn("If you need spatial features, install PostGIS on your PostgreSQL server.")
    }

    defineAssociations()

    await sequelize.sync({ force: true })
    console.log("✅ Database synchronized successfully")
  } catch (error) {
    console.error("❌ Database synchronization failed:", error)
    process.exit(1)
  }
}

module.exports = {
  sequelize,
  connectPostgres,
  connectMongoDB,
  Supplier,
  CoachProfile,
  AcademyProfile,
  TurfProfile,

  // Coach exports
  CoachSlot,
  CoachPayment,
  CoachReview,
  CoachMetric,
  CoachStudent,
  MonthlyCoachMetric,
  MonthlyStudentProgress,

  // Academy exports
  AcademyFee,
  AcademyBatch,
  AcademyProgram,
  AcademyMetric,
  AcademyAttendance,
  AcademyCoach,
  AcademyStudent,
  MonthlyStudentMetric,

  // Turf exports
  TurfGround,
  TurfSlot,
  TurfReview,
  TurfPayment,
  SlotRequest,
  TurfMetric,

  // Time exports
  Day,
  Month,
  Year,

  syncDatabase,
}
