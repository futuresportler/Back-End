require("dotenv").config()
const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const morgan = require("morgan")
const { info } = require("./src/config/logging")
const routes = require("./src/api/index")
const { connectMongoDB, connectPostgres, syncDatabase } = require("./src/database/index")
const { initScheduledTasks } = require("./src/scripts/scheduler")

// Initialize Express app
const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(helmet())
app.use(cors())
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Routes
app.use("/api", routes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  })
})

// Server
const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
  try {
    // Connect to databases
    await connectPostgres()
    await syncDatabase()

    // Initialize scheduled tasks
    initScheduledTasks()

    info(`Server running on port ${PORT}`)
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
})

module.exports = app
