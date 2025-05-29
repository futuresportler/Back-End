const express = require("express");
const router = express.Router();

// Import routes
const userRoutes = require("./routes/user.routes");
const supplierRoutes = require("./routes/supplier.routes");
const coachRoutes = require("./routes/coach.routes");
const academyRoutes = require("./routes/academy.routes");
const turfRoutes = require("./routes/turf.routes");
const groundRoutes = require("./routes/ground.routes");
const searchRoutes = require("./routes/search.routes");
const adminRoutes = require("./routes/admin.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const sessionRoutes = require("./routes/session.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const notificationRoutes = require("./routes/notification.routes");
const invitationRoutes = require("./routes/invitation.routes");
const promotionRoutes = require("./routes/promotion.routes");
const userBookingRoutes = require("./routes/booking.routes");
// Mount routes
router.use("/users", userRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/coaches", coachRoutes);
router.use("/academies", academyRoutes);
router.use("/turfs", turfRoutes);
router.use("/grounds", groundRoutes);
router.use("/search", searchRoutes);
router.use("/admin", adminRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/sessions", sessionRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/notifications", notificationRoutes);
router.use("/invitations", invitationRoutes);
router.use("/promotions", promotionRoutes);
router.use("/bookings", userBookingRoutes);
module.exports = router;
