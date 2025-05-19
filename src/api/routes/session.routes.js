const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Session request routes
router.post("/request", authenticate, sessionController.requestSession);
router.post("/confirm", authenticate, sessionController.confirmSessionRequest);
router.post("/reject", authenticate, sessionController.rejectSessionRequest);

// Session management routes
router.get(
  "/available/:service",
  authenticate,
  sessionController.getAvailableSessions
);
router.get(
  "/user/:service/:user_id",
  authenticate,
  sessionController.getUserSessions
);
router.post("/cancel", authenticate, sessionController.cancelSession);
router.post("/complete", authenticate, sessionController.completeSession);
router.post("/feedback", authenticate, sessionController.addSessionFeedback);

// New consolidated booking and session APIs
router.get(
  "/bookings/:user_id",
  authenticate,
  sessionController.getAllUserBookings
);
router.get(
  "/completed/:user_id",
  authenticate,
  sessionController.getLatestCompletedSessions
);
router.get(
  "/upcoming/:user_id",
  authenticate,
  sessionController.getUpcomingSessions
);

module.exports = router;
