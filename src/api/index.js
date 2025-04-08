const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/user.routes");
const coachRoutes = require("./routes/coach.routes");
const academyRoutes = require("./routes/academy.routes");
const turfRoutes = require("./routes/turf.routes");
const supplierRoutes = require("./routes/supplier.routes");

router.use("/suppliers", supplierRoutes);

router.use("/users", userRoutes);
router.use("/coaches", coachRoutes);
router.use("/academies", academyRoutes);
router.use("/turfs", turfRoutes);

module.exports = router;
