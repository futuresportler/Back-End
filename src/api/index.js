const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/user.routes");
const coachRoutes = require("./routes/coach.routes");

router.use("/users", userRoutes);
router.use("/coaches", coachRoutes);

module.exports = router;
