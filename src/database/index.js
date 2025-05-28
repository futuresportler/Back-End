const {
  sequelize,
  connectPostgres,
  connectMongoDB,
} = require("../config/database");
const { DataTypes } = require("sequelize");
const coachMetric = require("./models/postgres/coach/coachMetric");

// Import models
const Day = require("./models/postgres/day")(sequelize);
const Month = require("./models/postgres/month")(sequelize);
const Year = require("./models/postgres/year")(sequelize);

const User = require("./models/postgres/user")(sequelize);
const Supplier = require("./models/postgres/supplier")(sequelize);

const CoachProfile = require("./models/postgres/coach/coachProfile")(sequelize);
const CoachBatch = require("./models/postgres/coach/coachBatch")(sequelize);
const CoachPayment = require("./models/postgres/coach/coachPayment")(sequelize);
const CoachReview = require("./models/postgres/coach/coachReview")(sequelize);
const CoachMetric = require("./models/postgres/coach/coachMetric")(sequelize);
const CoachStudent = require("./models/postgres/coach/coachStudent")(sequelize);
const MonthlyCoachMetric =
  require("./models/postgres/coach/monthlyCoachMetric")(sequelize);
const BatchMonthlyMetric = require("./models/postgres/coach/batchMonthlyMetric")(sequelize);
const MonthlyStudentProgress =
  require("./models/postgres/coach/monthlyStudentProgress")(sequelize);

const AcademyProfile = require("./models/postgres/academy/academyProfile")(
  sequelize
);
const AcademyBatch = require("./models/postgres/academy/academyBatch")(
  sequelize
);
const AcademyProgram = require("./models/postgres/academy/academyProgram")(
  sequelize
);
const AcademyMetric = require("./models/postgres/academy/academyMetric")(
  sequelize
);
const AcademyAttendance =
  require("./models/postgres/academy/academyAttendance")(sequelize);
const AcademyCoach = require("./models/postgres/academy/academyCoach")(
  sequelize
);
const AcademyStudent = require("./models/postgres/academy/academyStudent")(
  sequelize
);
const AcademyFee = require("./models/postgres/academy/academyFee")(sequelize);
const AcademyProfileView = require("./models/postgres/academy/academyProfileView")(sequelize);
const AcademyInquiry = require("./models/postgres/academy/academyInquiry")(sequelize);
const MonthlyStudentMetric =
  require("./models/postgres/academy/monthlyStudentMetric")(sequelize);

const TurfProfile = require("./models/postgres/turf/turfProfile")(sequelize);
const TurfGround = require("./models/postgres/turf/turfGround")(sequelize);
const TurfSlot = require("./models/postgres/turf/turfSlot")(sequelize);
const TurfReview = require("./models/postgres/turf/turfReview")(sequelize);
const TurfPayment = require("./models/postgres/turf/turfPayment")(sequelize);
const SlotRequest = require("./models/postgres/turf/slotRequest")(sequelize);
const TurfMetric = require("./models/postgres/turf/turfMetric")(sequelize);
const TurfMonthlyMetric = require("./models/postgres/turf/turfMonthlyMetric")(sequelize);
// Session models will be initialized dynamically in the session service
const AcademyBookingPlatform = require("./models/postgres/academy/academyBookingPlatform")(sequelize);
const AcademyCoachBatch = require("./models/postgres/academy/academyCoachBatch")(sequelize);
const AcademyCoachProgram = require("./models/postgres/academy/academyCoachProgram")(sequelize);

const SessionFeedback = require("./models/postgres/sessions/sessionFeedback")(sequelize);
const BatchFeedback = require("./models/postgres/feedback/batchFeedback")(sequelize);
const ProgramFeedback = require("./models/postgres/feedback/programFeedback")(sequelize);
const AcademyReview = require("./models/postgres/academy/academyReview")(sequelize);
const Notification = require("./models/postgres/notification/notification")(sequelize);
const FeedbackReminder = require("./models/postgres/notification/feedbackReminder")(sequelize);
const BookingNotification = require("./models/postgres/notification/bookingNotification")(sequelize);
const AcademyInvitation = require("./models/postgres/academy/academyInvitation")(sequelize);
const UserDeviceToken = require("./models/postgres/userDeviceToken")(sequelize);
const PromotionTransaction = require("./models/postgres/promotion/promotionTransaction")(sequelize);
const CoachSession = require("./models/postgres/sessions/coachSession")(sequelize);
const TurfSession = require("./models/postgres/sessions/turfSession")(sequelize);
const AcademyBatchSession = require("./models/postgres/sessions/academyBatchSession")(sequelize);
const AcademyProgramSession = require("./models/postgres/sessions/academyProgramSession")(sequelize);

// Define Associations
const defineAssociations = () => {
  // Supplier -> Profile Relationships (One-to-One for Coach)
  Supplier.hasOne(CoachProfile, {
    foreignKey: "supplierId",
    as: "coachProfile",
  });
  CoachProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  });

  // One-to-Many for Academy and Turf
  Supplier.hasMany(AcademyProfile, {
    foreignKey: "supplierId",
    as: "academyProfiles",
  });
  AcademyProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  });
  Supplier.hasMany(TurfProfile, {
    foreignKey: "supplierId",
    as: "turfProfiles",
  });
  TurfProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  });

  // Time Hierarchy Relationships
  Year.hasMany(Month, {
    foreignKey: "yearId",
    as: "month",
  });
  Month.belongsTo(Year, {
    foreignKey: "yearId",
    as: "year",
  });

  Month.hasMany(Day, {
    foreignKey: "monthId",
    as: "day",
  });
  Day.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  });

  // Link Metrics to Time Structure
  Day.hasMany(AcademyMetric, {
    foreignKey: "dayId",
    as: "academyMetrics",
  });
  Day.hasMany(TurfMetric, {
    foreignKey: "dayId",
    as: "turfMetrics",
  });
  Day.hasMany(CoachMetric, {
    foreignKey: "dayId",
    as: "coachMetrics",
  });

  Month.hasMany(AcademyMetric, {
    foreignKey: "monthId",
    as: "academyMetrics",
  });
  Month.hasMany(TurfMetric, {
    foreignKey: "monthId",
    as: "turfMetrics",
  });
  Month.hasMany(CoachMetric, {
    foreignKey: "monthId",
    as: "coachMetrics",
  });
  Month.hasMany(MonthlyCoachMetric, {
    foreignKey: "monthId",
    as: "monthlyCoachMetrics",
  });
  Month.hasMany(MonthlyStudentProgress, {
    foreignKey: "monthId",
    as: "monthlyStudentProgress",
  });

  // AcademyProfile Associations
  AcademyProfile.hasMany(AcademyBatch, { foreignKey: "academyId" });
  AcademyProfile.hasMany(AcademyProgram, { foreignKey: "academyId" });
  AcademyProfile.hasMany(AcademyMetric, { foreignKey: "academyId" });
  AcademyProfile.hasMany(AcademyFee, { foreignKey: "academyId" });
  AcademyProfile.hasMany(AcademyCoach, { foreignKey: "academyId" });
  AcademyProfile.hasMany(AcademyStudent, { foreignKey: "academyId" });

  // Program Relationships
  AcademyProgram.hasMany(AcademyFee, { foreignKey: "programId" });

  AcademyStudent.belongsTo(AcademyProgram, {
    foreignKey: "programId",
    as: "program",
    allowNull: true, // This makes the relationship optional
  });

  AcademyProgram.hasMany(AcademyStudent, {
    foreignKey: "programId",
    as: "students",
  });

  // Batch Relationships
  AcademyBatch.hasMany(AcademyFee, { foreignKey: "batchId" });

  AcademyStudent.belongsTo(AcademyBatch, {
    foreignKey: "batchId",
    as: "batch",
    allowNull: true, // This makes the relationship optional
  });

  AcademyBatch.hasMany(AcademyStudent, {
    foreignKey: "batchId",
    as: "students",
  });
    // Academy Profile View Associations
  AcademyProfile.hasMany(AcademyProfileView, { 
    foreignKey: "academyId",
    as: "profileViews"
  });
  AcademyProfileView.belongsTo(AcademyProfile, { 
    foreignKey: "academyId",
    as: "academy"
  });
  User.hasMany(AcademyProfileView, {
    foreignKey: "userId",
    as: "academyViews"
  });
  AcademyProfileView.belongsTo(User, {
    foreignKey: "userId",
    as: "viewer"
  });

  // Academy Inquiry Associations
  AcademyProfile.hasMany(AcademyInquiry, {
    foreignKey: "academyId",
    as: "inquiries"
  });
  AcademyInquiry.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });
  AcademyProgram.hasMany(AcademyInquiry, {
    foreignKey: "programId",
    as: "inquiries"
  });
  AcademyInquiry.belongsTo(AcademyProgram, {
    foreignKey: "programId",
    as: "program"
  });
  // Fee Relationships
  AcademyFee.belongsTo(AcademyProfile, { foreignKey: "academyId" });
  AcademyFee.belongsTo(AcademyProgram, { foreignKey: "programId" });
  AcademyFee.belongsTo(AcademyBatch, { foreignKey: "batchId" });
  AcademyFee.belongsTo(User, { foreignKey: "studentId" });

  MonthlyStudentMetric.belongsTo(AcademyStudent, {
    foreignKey: "studentId",
  });

  MonthlyStudentMetric.belongsTo(AcademyProgram, {
    foreignKey: "programId",
  });

  MonthlyStudentMetric.belongsTo(AcademyBatch, {
    foreignKey: "batchId",
  });

  MonthlyStudentMetric.belongsTo(Month, {
    foreignKey: "monthId",
  });

  AcademyStudent.hasMany(MonthlyStudentMetric, {
    foreignKey: "studentId",
  });

  // Attendance Relationships
  AcademyAttendance.belongsTo(Day, { foreignKey: "dayId" });
  AcademyAttendance.belongsTo(AcademyProgram, { foreignKey: "programId" });
  AcademyAttendance.belongsTo(User, { foreignKey: "studentId" });

  // Metric Relationships
  AcademyMetric.belongsTo(Day, { foreignKey: "dayId" });
  AcademyMetric.belongsTo(Month, { foreignKey: "monthId" });

  // TurfProfile Associations
  TurfProfile.hasMany(TurfGround, {
    foreignKey: "turfId",
    as: "grounds",
  });
  TurfGround.belongsTo(TurfProfile, {
    foreignKey: "turfId",
    as: "turf",
  });

  // Ground Relationships
  TurfGround.hasMany(TurfSlot, {
    foreignKey: "groundId",
    as: "slots",
  });
  TurfSlot.belongsTo(TurfGround, {
    foreignKey: "groundId",
    as: "ground",
  });

  TurfGround.hasMany(TurfReview, {
    foreignKey: "groundId",
    as: "reviews",
  });
  TurfReview.belongsTo(TurfGround, {
    foreignKey: "groundId",
    as: "ground",
  });

  // Slot Relationships
  TurfSlot.belongsTo(Day, {
    foreignKey: "dayId",
  });
  TurfSlot.hasMany(SlotRequest, {
    foreignKey: "slotId",
    as: "requests",
  });

  // Payment Relationships
  TurfPayment.belongsTo(SlotRequest, {
    foreignKey: "requestId",
  });
  TurfPayment.belongsTo(User, {
    foreignKey: "userId",
  });

  // Review Validation
  TurfReview.belongsTo(User, {
    foreignKey: "userId",
  });
  TurfReview.belongsTo(TurfPayment, {
    foreignKey: "paymentId",
    constraints: false, // For optional relationship
  });

  // Metric Relationships
  TurfMetric.belongsTo(Day, { foreignKey: "dayId" });
  TurfMetric.belongsTo(Month, { foreignKey: "monthId" });


  Month.hasMany(TurfMonthlyMetric, {
    foreignKey: "monthId",
    as: "turfMonthlyMetrics",
  });

  TurfMonthlyMetric.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  });

  TurfProfile.hasMany(TurfMonthlyMetric, {
    foreignKey: "turfId",
    as: "monthlyMetrics",
  });

  TurfMonthlyMetric.belongsTo(TurfProfile, {
    foreignKey: "turfId",
    as: "turf",
  });
  // CoachProfile Associations

  CoachProfile.hasMany(CoachPayment, {
    foreignKey: "coachId",
  });
  CoachProfile.hasMany(CoachMetric, {
    foreignKey: "coachId",
  });
  CoachProfile.hasMany(CoachReview, {
    foreignKey: "coachId",
  });
  CoachProfile.hasMany(MonthlyCoachMetric, {
    foreignKey: "coachId",
    as: "monthlyMetrics",
  });

  // CoachBatch associations
  CoachProfile.hasMany(CoachBatch, {
    foreignKey: "coachId",
    as: "batches",
  });
  CoachBatch.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });

  // Update CoachStudent associations to include batch
  CoachStudent.belongsTo(CoachBatch, {
    foreignKey: "batchId",
    as: "batch",
    allowNull: true,
  });

  CoachStudent.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });

  CoachStudent.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  });

  CoachBatch.hasMany(CoachStudent, {
    foreignKey: "batchId",
    as: "students",
  });

  // Update CoachPayment associations to include batch
  CoachPayment.belongsTo(CoachBatch, {
    foreignKey: "batchId",
    as: "batch",
    allowNull: true,
  });

  CoachBatch.hasMany(CoachPayment, {
    foreignKey: "batchId",
    as: "payments",
  });

  // Monthly Coach Metrics
  MonthlyCoachMetric.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });
  MonthlyCoachMetric.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  });

  // Monthly Student Progress
  MonthlyStudentProgress.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });
  MonthlyStudentProgress.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  });
  MonthlyStudentProgress.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  });

  CoachProfile.hasMany(MonthlyStudentProgress, {
    foreignKey: "coachId",
    as: "studentProgress",
  });

  User.hasMany(MonthlyStudentProgress, {
    foreignKey: "userId",
    as: "progressReports",
  });

  // Student Relationships
  CoachProfile.belongsToMany(User, {
    through: CoachStudent,
    foreignKey: "coachId",
    otherKey: "userId",
    as: "students",
  });

  User.belongsToMany(CoachProfile, {
    through: CoachStudent,
    foreignKey: "userId",
    otherKey: "coachId",
    as: "coaches",
  });

  // Review Validation
  CoachReview.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });

  CoachReview.belongsTo(User, {
    foreignKey: "userId",
    as: "student",
  });

  CoachReview.belongsTo(CoachPayment, {
    foreignKey: "paymentId",
    constraints: false,
    as: "payment",
  });

  CoachMetric.belongsTo(Day, { foreignKey: "dayId" });
  CoachMetric.belongsTo(Month, { foreignKey: "monthId" });
  CoachMetric.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach",
  });
  Month.hasMany(BatchMonthlyMetric, {
    foreignKey: "monthId",
    as: "batchMonthlyMetrics",
  });

  BatchMonthlyMetric.belongsTo(Month, {
    foreignKey: "monthId",
    as: "month",
  });

  CoachBatch.hasMany(BatchMonthlyMetric, {
    foreignKey: "batchId",
    as: "monthlyMetrics",
  });

  BatchMonthlyMetric.belongsTo(CoachBatch, {
    foreignKey: "batchId",
    as: "batch",
  });

  CoachProfile.hasMany(BatchMonthlyMetric, {
    foreignKey: "coachId",
    as: "batchMetrics",
  });

  BatchMonthlyMetric.belongsTo(CoachProfile, {
      foreignKey: "coachId",
      as: "coach",
  });
   // Academy Coach associations
  AcademyProfile.hasMany(AcademyCoach, {
    foreignKey: "academyId",
    as: "coaches"
  });
  
  AcademyCoach.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });
  
  CoachProfile.hasMany(AcademyCoach, {
    foreignKey: "coachId",
    as: "academyPositions"
  });
  
  AcademyCoach.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "platformCoach"
  });
    // Many-to-Many: Academy Coach <-> Academy Batch
  AcademyCoach.belongsToMany(AcademyBatch, {
    through: AcademyCoachBatch,
    foreignKey: 'coachId',
    otherKey: 'batchId',
    as: 'batches'
  });
  
  AcademyBatch.belongsToMany(AcademyCoach, {
    through: AcademyCoachBatch,
    foreignKey: 'batchId',
    otherKey: 'coachId',
    as: 'coaches'
  });
  // Primary coach relationships
  AcademyBatch.belongsTo(AcademyCoach, {
    foreignKey: 'primaryCoachId',
    as: 'primaryCoach'
  });

  AcademyCoach.hasMany(AcademyBatch, {
    foreignKey: 'primaryCoachId',
    as: 'primaryBatches'
  });

  // Many-to-Many: Academy Coach <-> Academy Program
  AcademyCoach.belongsToMany(AcademyProgram, {
    through: AcademyCoachProgram,
    foreignKey: 'coachId',
    otherKey: 'programId',
    as: 'programs'
  });
  
  AcademyProgram.belongsToMany(AcademyCoach, {
    through: AcademyCoachProgram,
    foreignKey: 'programId',
    otherKey: 'coachId',
    as: 'coaches'
  });
    // Primary coach relationships for programs
  AcademyProgram.belongsTo(AcademyCoach, {
    foreignKey: 'primaryCoachId',
    as: 'primaryCoach'
  });

  AcademyCoach.hasMany(AcademyProgram, {
    foreignKey: 'primaryCoachId',
    as: 'primaryPrograms'
  });

  // Junction table associations
  AcademyCoachBatch.belongsTo(AcademyCoach, {
    foreignKey: 'coachId',
    as: 'coach'
  });

  AcademyCoachBatch.belongsTo(AcademyBatch, {
    foreignKey: 'batchId',
    as: 'batch'
  });

  AcademyCoachProgram.belongsTo(AcademyCoach, {
    foreignKey: 'coachId',
    as: 'coach'
  });

  AcademyCoachProgram.belongsTo(AcademyProgram, {
    foreignKey: 'programId',
    as: 'program'
  });

    AcademyProfile.hasMany(AcademyReview, {
      foreignKey: "academyId",
      as: "reviews",
    });
    AcademyReview.belongsTo(AcademyProfile, {
      foreignKey: "academyId",
      as: "academy",
    });
    User.hasMany(AcademyReview, {
      foreignKey: "userId",
      as: "academyReviews",
    });
    AcademyReview.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
    });

    // Session Feedback Associations
    User.hasMany(SessionFeedback, {
      foreignKey: "userId",
      as: "sessionFeedbacks",
    });
    SessionFeedback.belongsTo(User, {
      foreignKey: "userId",
      as: "user",
    });
      // Batch Feedback Associations
  User.hasMany(BatchFeedback, {
    foreignKey: "userId",
    as: "batchFeedbacks",
  });
  BatchFeedback.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Program Feedback Associations
  AcademyProgram.hasMany(ProgramFeedback, {
    foreignKey: "programId",
    as: "feedbacks",
  });
  ProgramFeedback.belongsTo(AcademyProgram, {
    foreignKey: "programId",
    as: "program",
  });
  User.hasMany(ProgramFeedback, {
    foreignKey: "userId",
    as: "programFeedbacks",
  });
  ProgramFeedback.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
  
  // Notification Associations
  User.hasMany(Notification, {
    foreignKey: "recipientId",
    constraints: false,
    scope: {
      recipientType: 'user'
    },
    as: "userNotifications"
  });

  Notification.belongsTo(User, {
    foreignKey: "recipientId",
    constraints: false,
    as: "userRecipient"
  });

  CoachProfile.hasMany(Notification, {
    foreignKey: "recipientId",
    constraints: false,
    scope: {
      recipientType: 'coach'
    },
    as: "coachNotifications"
  });

  AcademyProfile.hasMany(Notification, {
    foreignKey: "recipientId",
    constraints: false,
    scope: {
      recipientType: 'academy'
    },
    as: "academyNotifications"
  });

  TurfProfile.hasMany(Notification, {
    foreignKey: "recipientId",
    constraints: false,
    scope: {
      recipientType: 'turf'
    },
    as: "turfNotifications"
  });

  // Feedback Reminder Associations
  CoachProfile.hasMany(FeedbackReminder, {
    foreignKey: "coachId",
    as: "coachFeedbackReminders"
  });

  FeedbackReminder.belongsTo(CoachProfile, {
    foreignKey: "coachId",
    as: "coach"
  });

  AcademyCoach.hasMany(FeedbackReminder, {
    foreignKey: "coachId",
    as: "academyCoachFeedbackReminders"
  });

  FeedbackReminder.belongsTo(AcademyCoach, {
    foreignKey: "coachId",
    as: "academyCoach"
  });

  User.hasMany(FeedbackReminder, {
    foreignKey: "studentId",
    as: "studentFeedbackReminders"
  });

  FeedbackReminder.belongsTo(User, {
    foreignKey: "studentId",
    as: "student"
  });

  AcademyBatch.hasMany(FeedbackReminder, {
    foreignKey: "batchId",
    as: "batchFeedbackReminders"
  });

  FeedbackReminder.belongsTo(AcademyBatch, {
    foreignKey: "batchId",
    as: "batch"
  });

  AcademyProgram.hasMany(FeedbackReminder, {
    foreignKey: "programId",
    as: "programFeedbackReminders"
  });

  FeedbackReminder.belongsTo(AcademyProgram, {
    foreignKey: "programId",
    as: "program"
  });

  AcademyProfile.hasMany(FeedbackReminder, {
    foreignKey: "academyId",
    as: "academyFeedbackReminders"
  });

  FeedbackReminder.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });

  // Booking Notification Associations
  SlotRequest.hasMany(BookingNotification, {
    foreignKey: "requestId",
    as: "bookingNotifications"
  });

  BookingNotification.belongsTo(SlotRequest, {
    foreignKey: "requestId",
    as: "slotRequest"
  });

  TurfProfile.hasMany(BookingNotification, {
    foreignKey: "supplierId",
    constraints: false,
    scope: {
      supplierType: 'turf'
    },
    as: "turfBookingNotifications"
  });

  AcademyProfile.hasMany(BookingNotification, {
    foreignKey: "supplierId",
    constraints: false,
    scope: {
      supplierType: 'academy'
    },
    as: "academyBookingNotifications"
  });

  CoachProfile.hasMany(BookingNotification, {
    foreignKey: "supplierId",
    constraints: false,
    scope: {
      supplierType: 'coach'
    },
    as: "coachBookingNotifications"
  });
  // Academy Invitation associations
  AcademyInvitation.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });

  AcademyInvitation.belongsTo(Supplier, {
    foreignKey: "inviterSupplierId",
    as: "inviter"
  });

  AcademyInvitation.belongsTo(Supplier, {
    foreignKey: "inviteeSupplierId",
    as: "invitee"
  });

  AcademyProfile.hasMany(AcademyInvitation, {
    foreignKey: "academyId",
    as: "invitations"
  });
  User.hasMany(UserDeviceToken, {
    foreignKey: "userId",
    as: "deviceTokens"
  });

  UserDeviceToken.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  Supplier.hasMany(UserDeviceToken, {
    foreignKey: "supplierId", 
    as: "deviceTokens"
  });

  UserDeviceToken.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier"
  });

  CoachProfile.hasMany(UserDeviceToken, {
    foreignKey: "coachId",
    as: "deviceTokens"
  });

  UserDeviceToken.belongsTo(CoachProfile, {
    foreignKey: "coachId", 
    as: "coach"
  });
  AcademyStudent.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  User.hasMany(AcademyStudent, {
    foreignKey: "userId", 
    as: "student"
  });
    // Coach Session associations
  CoachSession.belongsTo(CoachBatch, {
    foreignKey: 'batch_id',
    targetKey: 'batchId', // CoachBatch primary key
    as: 'batch'
  });

  CoachSession.belongsTo(CoachProfile, {
    foreignKey: 'coach_id',
    targetKey: 'coachId', // CoachProfile primary key
    as: 'coach'
  });

  CoachSession.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'userId', // User primary key
    as: 'user'
  });
  // Academy Batch Session associations
  AcademyBatchSession.belongsTo(AcademyBatch, {
    foreignKey: 'batch_id',
    targetKey: 'batchId', // AcademyBatch primary key
    as: 'batch'
  });

  AcademyBatchSession.belongsTo(AcademyProfile, {
    foreignKey: 'academy_id',
    targetKey: 'academyId', // AcademyProfile primary key
    as: 'academy'
  });

  AcademyBatchSession.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'userId', // User primary key
    as: 'user'
  });
  AcademyBatchSession.belongsTo(AcademyCoach, {
    foreignKey: "academyCoachId",
    as: "academyCoach"
  });
  // Academy Program Session associations
    AcademyProgramSession.belongsTo(AcademyProgram, {
    foreignKey: 'program_id',
    targetKey: 'programId', // AcademyProgram primary key
    as: 'program'
  });

  AcademyProgramSession.belongsTo(AcademyProfile, {
    foreignKey: 'academy_id',
    targetKey: 'academyId', // AcademyProfile primary key
    as: 'academy'
  });

  AcademyProgramSession.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'userId', // User primary key
    as: 'user'
  });
  AcademyProgramSession.belongsTo(AcademyCoach, {
    foreignKey: "academyCoachId",
    as: "academyCoach"
  });
  // Turf Session associations
    TurfSession.belongsTo(TurfGround, {
    foreignKey: 'ground_id',
    targetKey: 'groundId', // TurfGround primary key
    as: 'ground'
  });

  TurfSession.belongsTo(TurfProfile, {
    foreignKey: 'turf_id',
    targetKey: 'turfId', // TurfProfile primary key
    as: 'turf'
  });

  TurfSession.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'userId', // User primary key
    as: 'user'
  });
  TurfSession.belongsTo(AcademyCoach, {
    foreignKey: "academyCoachId",
    as: "academyCoach"
  });
    // Academy Batch associations
  AcademyBatch.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });
    // Academy Program associations
  AcademyProgram.belongsTo(AcademyProfile, {
    foreignKey: "academyId",
    as: "academy"
  });
  
  // Coach Session Associations

  CoachBatch.hasMany(CoachSession, {
    foreignKey: 'batchId',
    as: 'sessions'
  });

  CoachProfile.hasMany(CoachSession, {
    foreignKey: 'coachId',
    as: 'sessions'
  });

  User.hasMany(CoachSession, {
    foreignKey: 'userId',
    as: 'coachSessions'
  });

  // Academy Batch Session Associations

  AcademyBatch.hasMany(AcademyBatchSession, {
    foreignKey: 'batchId',
    as: 'sessions'
  });

  AcademyProfile.hasMany(AcademyBatchSession, {
    foreignKey: 'academyId',
    as: 'batchSessions'
  });

  User.hasMany(AcademyBatchSession, {
    foreignKey: 'userId',
    as: 'academyBatchSessions'
  });

  // Academy Program Session Associations
  AcademyProgram.hasMany(AcademyProgramSession, {
    foreignKey: 'programId',
    as: 'sessions'
  });

  AcademyProfile.hasMany(AcademyProgramSession, {
    foreignKey: 'academyId',
    as: 'programSessions'
  });

  User.hasMany(AcademyProgramSession, {
    foreignKey: 'userId',
    as: 'academyProgramSessions'
  });

  // Turf Session Associations

  TurfGround.hasMany(TurfSession, {
    foreignKey: 'groundId',
    as: 'sessions'
  });

  TurfProfile.hasMany(TurfSession, {
    foreignKey: 'turfId',
    as: 'sessions'
  });

  User.hasMany(TurfSession, {
    foreignKey: 'userId',
    as: 'turfSessions'
  });
  
  // AcademyCoach associations with session models
  AcademyCoach.hasMany(TurfSession, {
    foreignKey: "academyCoachId",
    as: "turfSessions",
  });

  AcademyCoach.hasMany(AcademyBatchSession, {
    foreignKey: "academyCoachId",
    as: "batchSessions",
  });

  AcademyCoach.hasMany(AcademyProgramSession, {
    foreignKey: "academyCoachId",
    as: "programSessions",
  });

};

// Database Sync Function
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    defineAssociations();

    // Try to create PostGIS extension, but continue if it fails
    try {
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis");
      console.log("✅ PostGIS extension enabled");
    } catch (error) {
      console.warn(
        "⚠️ PostGIS extension not available. Spatial features will be limited."
      );
      console.warn(
        "If you need spatial features, install PostGIS on your PostgreSQL server."
      );
    }

        // Skip the Day model entirely in sync
    const models = Object.values(sequelize.models).filter(
      model => model.name !== 'Day'
    );
    
    // Sync all models except Day
    for (const model of models) {
      try {
        await model.sync({ alter: true }); // Never use alter in production
        console.log(`Synced ${model.name} successfully`);
      } catch (error) {
        console.error(`Error syncing ${model.name}:`, error.message);
      }
    }
    // Sync models individually with force:false, alter:false first to create tables safely
    // console.log("Creating tables if they don't exist...");
    // await sequelize.sync({ force: false, alter: false });
        
    // // Then try to sync Year and Month models first to establish their relationship
    // console.log("Syncing time models...");
    // await Year.sync({ alter: true });
    // await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectPostgres,
  connectMongoDB,
  Supplier,
  CoachProfile,
  CoachBatch,
  AcademyProfile,
  TurfProfile,
  UserDeviceToken,

  // Coach exports
  CoachPayment,
  CoachReview,
  CoachMetric,
  CoachStudent,
  MonthlyCoachMetric,
  MonthlyStudentProgress,
  BatchMonthlyMetric,


  // Academy exports
  AcademyFee,
  AcademyBatch,
  AcademyProgram,
  AcademyMetric,
  AcademyAttendance,
  AcademyCoach,
  AcademyStudent,
  MonthlyStudentMetric,
  AcademyProfileView,
  AcademyInquiry,
  AcademyBookingPlatform,
  AcademyCoachBatch,
  AcademyCoachProgram,
  AcademyInvitation,


  // Turf exports
  TurfGround,
  TurfSlot,
  TurfReview,
  TurfPayment,
  SlotRequest,
  TurfMetric,
  TurfMonthlyMetric,
  // Time exports
  Day,
  Month,
  Year,
  User,

  //feedback exports
  SessionFeedback,
  BatchFeedback,
  ProgramFeedback,
  AcademyReview,

  //notification exports
  Notification,
  FeedbackReminder,
  BookingNotification,

  // Add session exports
  CoachSession,
  AcademyBatchSession,
  AcademyProgramSession,
  TurfSession,
  
  //promotion
  PromotionTransaction,
  
  syncDatabase,
};
