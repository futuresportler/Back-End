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

const { sequelize } = require("../config/database");


// 🔗 Define Associations

// User & Role (One-to-Many)
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// User & UserAchievement (One-to-Many)
User.hasMany(UserAchievement, { foreignKey: "userId" });
UserAchievement.belongsTo(User, { foreignKey: "userId" });

// User & CoachProfile (One-to-One)
User.hasOne(CoachProfile, { foreignKey: "coach_id" });
CoachProfile.belongsTo(User, { foreignKey: "coach_id" });

// User & AcademyProfile (One-to-One)
User.hasOne(AcademyProfile, { foreignKey: "academy_id" });
AcademyProfile.belongsTo(User, { foreignKey: "academy_id" });

// Sport & AcademySports (One-to-Many)
Sport.hasMany(AcademySport, { foreignKey: "sport_id" });
AcademySport.belongsTo(Sport, { foreignKey: "sport_id" });

// AcademyProfile & AcademySports (One-to-Many)
AcademyProfile.hasMany(AcademySport, { foreignKey: "academy_id" });
AcademySport.belongsTo(AcademyProfile, { foreignKey: "academy_id" });

// CoachProfile & CoachSports (One-to-Many)
CoachProfile.hasMany(CoachSport, { foreignKey: "coach_id" });
CoachSport.belongsTo(CoachProfile, { foreignKey: "coach_id" });

// Sport & CoachSports (One-to-Many)
Sport.hasMany(CoachSport, { foreignKey: "sport_id" });
CoachSport.belongsTo(Sport, { foreignKey: "sport_id" });

// CoachProfile & AcademyProfile (Many-to-Many via AcademyCoach)
CoachProfile.belongsToMany(AcademyProfile, {
  through: AcademyCoach,
  foreignKey: "coach_id",
});
AcademyProfile.belongsToMany(CoachProfile, {
  through: AcademyCoach,
  foreignKey: "academy_id",
});

// Define explicit AcademyCoach associations
AcademyCoach.belongsTo(CoachProfile, { foreignKey: "coach_id" });
AcademyCoach.belongsTo(AcademyProfile, { foreignKey: "academy_id" });
CoachProfile.hasMany(AcademyCoach, { foreignKey: "coach_id" });
AcademyProfile.hasMany(AcademyCoach, { foreignKey: "academy_id" });


const syncDatabase = async () => {
  try {
    await sequelize.authenticate(); // Ensure DB connection is active

    await User.sync({ alter: true });
    await Role.sync({ alter: true });
    await Sport.sync({ alter: true });
    await Certification.sync({ alter: true });
    await CoachProfile.sync({ alter: true }); 
    await AcademyProfile.sync({ alter: true });

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
  connectMongoDB,
  connectPostgres,
};

// $ psql -U postgres