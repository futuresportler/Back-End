const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("future_sportler", "postgres", "fs-root-25", {
  host: "future-sportler-primary-database.cbekoqei89i4.eu-north-1.rds.amazonaws.com",
  dialect: "postgres",
  port: 5432,
  logging: false,
});

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// PostgreSQL Connection
const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize, // Make sure `sequelize` is exported separately
  connectMongoDB,
  connectPostgres,
};
