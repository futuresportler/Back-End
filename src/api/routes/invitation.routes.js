const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitation.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Invite manager to academy
router.post("/academy/:academyId/invite-manager", 
  authMiddleware, 
  invitationController.inviteManager
);

// Invite coach to academy
router.post("/academy/:academyId/invite-coach", 
  authMiddleware, 
  invitationController.inviteCoach
);

// Accept invitation
router.post("/accept/:invitationToken", 
  authMiddleware, 
  invitationController.acceptInvitation
);

// Reject invitation
router.post("/reject/:invitationToken", 
  authMiddleware, 
  invitationController.rejectInvitation
);

// Get supplier invitations
router.get("/supplier/invitations", 
  authMiddleware, 
  invitationController.getSupplierInvitations
);

// Get managing academies for supplier
router.get("/supplier/managing-academies", 
  authMiddleware, 
  invitationController.getManagingAcademies
);

module.exports = router;