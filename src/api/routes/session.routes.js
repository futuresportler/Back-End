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

module.exports = router;
