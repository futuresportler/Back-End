require("dotenv").config(); // Load environment variables from .env

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  database: {
    mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/myapp",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "supersecretkey",
    jwtExpiration: process.env.JWT_EXPIRATION || "1h",
  },

  cache: {
    redisURL: process.env.REDIS_URL || "redis://localhost:6379",
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};
