const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/user.routes");
const coachRoutes = require("./routes/coach.routes");
const academyRoutes = require("./routes/academy.routes");

router.use("/users", userRoutes);
router.use("/coaches", coachRoutes);
router.use("/academies", academyRoutes);

module.exports = router;
