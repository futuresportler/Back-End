const { connectMongoDB, connectPostgres } = require("../config/database");

const User = require("./models/postgres/user");
const Role = require("./models/postgres/role");
const Sport = require("./models/postgres/sport");
const UserAchievement = require("./models/postgres/userAchievement");
const CoachSport = require("./models/postgres/coachSport");
const CoachProfile = require("./models/postgres/coachProfile");
const Certification = require("./models/postgres/certification");
const AcademySport = require("./models/postgres/academySport");
const AcademyProfile = require("./models/postgres/academyProfile");
const AcademyCoach = require("./models/postgres/academyCoach");
const TurfProfile = require("./models/postgres/turfProfile");
const Review = require("./models/postgres/review");

const { sequelize } = require("../config/database");

// 🔗 Define Associations

// User & Role (One-to-Many)
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// User & UserAchievement (One-to-Many)
User.hasMany(UserAchievement, { foreignKey: "userId" });
UserAchievement.belongsTo(User, { foreignKey: "userId" });

// User & CoachProfile (One-to-One)
// User.hasOne(CoachProfile, { foreignKey: "coachId" });
// CoachProfile.belongsTo(User, { foreignKey: "coachId" });

// User & AcademyProfile (One-to-One)
// User.hasOne(AcademyProfile, { foreignKey: "academyId" });
// AcademyProfile.belongsTo(User, { foreignKey: "academyId" });

// Sport & AcademySports (One-to-Many)
Sport.hasMany(AcademySport, { foreignKey: "sport_id" });
AcademySport.belongsTo(Sport, { foreignKey: "sport_id" });

// AcademyProfile & AcademySports (One-to-Many)
AcademyProfile.hasMany(AcademySport, { foreignKey: "academyId" });
AcademySport.belongsTo(AcademyProfile, { foreignKey: "academyId" });

// CoachProfile & CoachSports (One-to-Many)
CoachProfile.hasMany(CoachSport, { foreignKey: "coachId" });
CoachSport.belongsTo(CoachProfile, { foreignKey: "coachId" });

// Sport & CoachSports (One-to-Many)
Sport.hasMany(CoachSport, { foreignKey: "sport_id" });
CoachSport.belongsTo(Sport, { foreignKey: "sport_id" });

// CoachProfile & AcademyProfile (Many-to-Many via AcademyCoach)
CoachProfile.belongsToMany(AcademyProfile, {
  through: AcademyCoach,
  foreignKey: "coachId",
});
AcademyProfile.belongsToMany(CoachProfile, {
  through: AcademyCoach,
  foreignKey: "academyId",
});

// Define explicit AcademyCoach associations
AcademyCoach.belongsTo(CoachProfile, { foreignKey: "coachId" });
AcademyCoach.belongsTo(AcademyProfile, { foreignKey: "academyId" });
CoachProfile.hasMany(AcademyCoach, { foreignKey: "coachId" });
AcademyProfile.hasMany(AcademyCoach, { foreignKey: "academyId" });

// Reviews associations
User.hasMany(Review, { foreignKey: "reviewer_id", as: "authoredReviews" });
Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

// Coach can have many reviews
CoachProfile.hasMany(Review, {
  foreignKey: "entity_id",
  constraints: false,
  scope: {
    entity_type: "Coach",
  },
  as: "reviews",
});

// Turf can have many reviews
TurfProfile.hasMany(Review, {
  foreignKey: "entity_id",
  constraints: false,
  scope: {
    entity_type: "Turf",
  },
  as: "reviews",
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate(); // Ensure DB connection is active

    await Role.sync({ alter: true });
    await Sport.sync({ alter: true });
    await Certification.sync({ alter: true });
    await User.sync({ alter: true });
    await CoachProfile.sync({ alter: true });
    await AcademyProfile.sync({ alter: true });
    await TurfProfile.sync({ alter: true });

    await Review.sync({ alter: true });
    await CoachSport.sync({ alter: true });
    await AcademySport.sync({ alter: true });
    await AcademyCoach.sync({ alter: true });
    await UserAchievement.sync({ alter: true });

    console.log("✅ Database synced successfully!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

syncDatabase();

module.exports = {
  sequelize,
  User,
  Role,
  Sport,
  UserAchievement,
  CoachSport,
  CoachProfile,
  Certification,
  AcademySport,
  AcademyProfile,
  AcademyCoach,
  TurfProfile,
  Review,
  connectMongoDB,
  connectPostgres,
};

// $ psql -U postgres -W

// to add geometry package to the db
// sudo apt update
// sudo apt install postgis postgresql-16-postgis-3


// to restart db
// sudo systemctl restart postgresql
