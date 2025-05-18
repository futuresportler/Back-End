/**
 * Configuration file for the application
 * Contains environment variables and dynamic configuration settings
 */

// Load environment variables
require("dotenv").config()

// Default values for environment variables if not set
const defaults = {
  // Server configuration
  PORT: 3000,
  NODE_ENV: "development",
  LOG_LEVEL: "info",

  // Database configuration
  DB_HOST: "localhost",
  DB_PORT: 5432,
  DB_NAME: "sportler",
  DB_USER: "postgres",
  DB_PASSWORD: "postgres",
  MONGO_URI: "mongodb://localhost:27017/sportler",

  // Authentication
  JWT_SECRET: "your-secret-key",
  JWT_EXPIRATION: "1d",
  REFRESH_SECRET: "your-refresh-secret",
  REFRESH_EXPIRATION: "7d",

  // Email service
  EMAIL_HOST: "smtp.example.com",
  EMAIL_PORT: 587,
  EMAIL_USER: "",
  EMAIL_PASS: "",

  // Firebase
  FIREBASE_API_KEY: "",
  FIREBASE_AUTH_DOMAIN: "",
  FIREBASE_PROJECT_ID: "",

  // Scheduler configuration
  SESSION_GENERATION_CRON: "15 0 * * *", // 12:15 AM daily
  SLOT_GENERATION_CRON: "0 0 * * *", // 12:00 AM daily
  FEE_GENERATION_CRON: "0 1 * * *", // 1:00 AM daily

  // Session configuration
  DEFAULT_SESSION_DURATION: 60, // in minutes
  MAX_SESSIONS_PER_DAY: 10,

  // Turf slot configuration
  DEFAULT_SLOT_DURATION: 60, // in minutes
  SLOT_START_HOUR: 6, // 6 AM
  SLOT_END_HOUR: 22, // 10 PM

  // Academy configuration
  DEFAULT_BATCH_SIZE: 20,
  DEFAULT_PROGRAM_DURATION: 90, // in days

  // Coach configuration
  DEFAULT_COACH_BATCH_SIZE: 10,

  // Payment configuration
  PAYMENT_GATEWAY_API_KEY: "",
  PAYMENT_SUCCESS_URL: "/payment/success",
  PAYMENT_FAILURE_URL: "/payment/failure",

  // Notification configuration
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_PUSH_NOTIFICATIONS: false,

  // Cache configuration
  CACHE_TTL: 3600, // in seconds

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds
  RATE_LIMIT_MAX: 100, // maximum 100 requests per window
}

// Get environment variable or use default
const getEnv = (key) => process.env[key] || defaults[key]

// Configuration object
const config = {
  // Server
  server: {
    port: Number.parseInt(getEnv("PORT"), 10),
    environment: getEnv("NODE_ENV"),
    logLevel: getEnv("LOG_LEVEL"),
  },

  // Database
  database: {
    postgres: {
      host: getEnv("DB_HOST"),
      port: Number.parseInt(getEnv("DB_PORT"), 10),
      database: getEnv("DB_NAME"),
      username: getEnv("DB_USER"),
      password: getEnv("DB_PASSWORD"),
    },
    mongo: {
      uri: getEnv("MONGO_URI"),
    },
  },

  // Authentication
  auth: {
    jwtSecret: getEnv("JWT_SECRET"),
    jwtExpiration: getEnv("JWT_EXPIRATION"),
    refreshSecret: getEnv("REFRESH_SECRET"),
    refreshExpiration: getEnv("REFRESH_EXPIRATION"),
  },

  // Email
  email: {
    host: getEnv("EMAIL_HOST"),
    port: Number.parseInt(getEnv("EMAIL_PORT"), 10),
    user: getEnv("EMAIL_USER"),
    pass: getEnv("EMAIL_PASS"),
  },

  // Firebase
  firebase: {
    apiKey: getEnv("FIREBASE_API_KEY"),
    authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
    projectId: getEnv("FIREBASE_PROJECT_ID"),
  },

  // Scheduler
  scheduler: {
    sessionGeneration: getEnv("SESSION_GENERATION_CRON"),
    slotGeneration: getEnv("SLOT_GENERATION_CRON"),
    feeGeneration: getEnv("FEE_GENERATION_CRON"),
  },

  // Session
  session: {
    defaultDuration: Number.parseInt(getEnv("DEFAULT_SESSION_DURATION"), 10),
    maxPerDay: Number.parseInt(getEnv("MAX_SESSIONS_PER_DAY"), 10),
    // Dynamic session generation rules
    rules: {
      academy: {
        // These will be populated from the database
        programs: [],
        batches: [],
        // Default days and times if not specified
        defaultDays: ["Mon", "Wed", "Fri"],
        defaultStartTime: "16:00",
        defaultEndTime: "17:00",
      },
      turf: {
        // These will be populated from the database
        grounds: [],
        // Default slot configuration
        defaultSlots: [
          "06:00-07:00",
          "07:00-08:00",
          "08:00-09:00",
          "09:00-10:00",
          "10:00-11:00",
          "11:00-12:00",
          "12:00-13:00",
          "13:00-14:00",
          "14:00-15:00",
          "15:00-16:00",
          "16:00-17:00",
          "17:00-18:00",
          "18:00-19:00",
          "19:00-20:00",
          "20:00-21:00",
          "21:00-22:00",
        ],
      },
      coach: {
        // These will be populated from the database
        batches: [],
        // Default days and times if not specified
        defaultDays: ["Tue", "Thu", "Sat"],
        defaultStartTime: "18:00",
        defaultEndTime: "19:00",
      },
    },
  },

  // Turf
  turf: {
    slotDuration: Number.parseInt(getEnv("DEFAULT_SLOT_DURATION"), 10),
    startHour: Number.parseInt(getEnv("SLOT_START_HOUR"), 10),
    endHour: Number.parseInt(getEnv("SLOT_END_HOUR"), 10),
  },

  // Academy
  academy: {
    batchSize: Number.parseInt(getEnv("DEFAULT_BATCH_SIZE"), 10),
    programDuration: Number.parseInt(getEnv("DEFAULT_PROGRAM_DURATION"), 10),
  },

  // Coach
  coach: {
    batchSize: Number.parseInt(getEnv("DEFAULT_COACH_BATCH_SIZE"), 10),
  },

  // Payment
  payment: {
    gatewayApiKey: getEnv("PAYMENT_GATEWAY_API_KEY"),
    successUrl: getEnv("PAYMENT_SUCCESS_URL"),
    failureUrl: getEnv("PAYMENT_FAILURE_URL"),
  },

  // Notification
  notification: {
    enableEmail: getEnv("ENABLE_EMAIL_NOTIFICATIONS") === "true",
    enablePush: getEnv("ENABLE_PUSH_NOTIFICATIONS") === "true",
  },

  // Cache
  cache: {
    ttl: Number.parseInt(getEnv("CACHE_TTL"), 10),
  },

  // Rate limiting
  rateLimit: {
    windowMs: Number.parseInt(getEnv("RATE_LIMIT_WINDOW"), 10),
    max: Number.parseInt(getEnv("RATE_LIMIT_MAX"), 10),
  },

  // Function to load dynamic configuration from database
  loadDynamicConfig: async (db) => {
    try {
      // Load academy programs
      const programs = await db.AcademyProgram.findAll({ where: { active: true } })
      config.session.rules.academy.programs = programs.map((program) => ({
        id: program.id,
        days: program.days || config.session.rules.academy.defaultDays,
        start_time: program.startTime || config.session.rules.academy.defaultStartTime,
        end_time: program.endTime || config.session.rules.academy.defaultEndTime,
      }))

      // Load academy batches
      const batches = await db.AcademyBatch.findAll({ where: { active: true } })
      config.session.rules.academy.batches = batches.map((batch) => ({
        id: batch.id,
        days: batch.days || config.session.rules.academy.defaultDays,
        start_time: batch.startTime || config.session.rules.academy.defaultStartTime,
        end_time: batch.endTime || config.session.rules.academy.defaultEndTime,
      }))

      // Load turf grounds
      const grounds = await db.TurfGround.findAll({ where: { active: true } })
      config.session.rules.turf.grounds = grounds.map((ground) => ({
        id: ground.id,
        slots: ground.slots ? ground.slots.split(",") : config.session.rules.turf.defaultSlots,
      }))

      // Load coach batches
      const coachBatches = await db.CoachBatch.findAll({ where: { active: true } })
      config.session.rules.coach.batches = coachBatches.map((batch) => ({
        id: batch.id,
        days: batch.days || config.session.rules.coach.defaultDays,
        start_time: batch.startTime || config.session.rules.coach.defaultStartTime,
        end_time: batch.endTime || config.session.rules.coach.defaultEndTime,
      }))

      return true
    } catch (error) {
      console.error("Error loading dynamic configuration:", error)
      return false
    }
  },
}

module.exports = config
