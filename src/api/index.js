const express = require("express")
const router = express.Router()

// Import routes
const userRoutes = require("./routes/user.routes")
const adminRoutes = require("./routes/admin.routes")
const academyRoutes = require("./routes/academy.routes")
const coachRoutes = require("./routes/coach.routes")
const turfRoutes = require("./routes/turf.routes")
const supplierRoutes = require("./routes/supplier.routes")
const groundRoutes = require("./routes/ground.routes")

// Import middleware
const errorMiddleware = require("./middlewares/error.middleware")

// Mount routes
router.use("/users", userRoutes)
router.use("/admin", adminRoutes)
router.use("/academies", academyRoutes)
router.use("/coaches", coachRoutes)
router.use("/turfs", turfRoutes)
router.use("/suppliers", supplierRoutes)
router.use("/", groundRoutes) // Mount ground routes at the root level

// Error handling middleware
if (errorMiddleware && typeof errorMiddleware === "function") {
  router.use(errorMiddleware)
} else {
  console.warn("Warning: errorMiddleware is not a function, skipping...")
}

module.exports = router
