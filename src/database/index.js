const { sequelize, connectPostgres, connectMongoDB } = require("../config/database");
const { DataTypes } = require("sequelize");

// Import models
const Supplier = require("./models/postgres/supplier")(sequelize);
const CoachProfile = require("./models/postgres/coachProfile")(sequelize);
const AcademyProfile = require("./models/postgres/academyProfile")(sequelize);
const TurfProfile = require("./models/postgres/turfProfile")(sequelize);
// const Review = require("./models/postgres/review");
// const Sport = require("./models/postgres/sport");
// const Certification = require("./models/postgres/certification");

// Define Associations
const defineAssociations = () => {
  // Supplier -> Profile Relationships
  Supplier.hasOne(CoachProfile, {
    foreignKey: "supplierId",
    as: "coachProfile",
  });
  CoachProfile.belongsTo(Supplier, {
    foreignKey: "supplierId",
    as: "supplier",
  });

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
};

// Database Sync Function
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();    
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis');

    defineAssociations();

    await sequelize.sync({ alter: true });
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
  AcademyProfile,
  TurfProfile,
  syncDatabase,
};

// $ psql -U postgres -W

// to add geometry package to the db
// sudo apt update
// sudo apt install postgis postgresql-16-postgis-3

// to restart db
// sudo systemctl restart postgresql
