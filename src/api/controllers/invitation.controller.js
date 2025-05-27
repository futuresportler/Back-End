const academyService = require("../../services/academy/academyService");
const { AcademyProfile, AcademyInvitation } = require("../../database");
const { successResponse, errorResponse } = require("../../common/utils/response");

const inviteManager = async (req, res) => {
  try {
    const { academyId } = req.params;
    const { phoneNumber, email, name } = req.body;
    
    const invitation = await academyService.inviteManager(
      academyId,
      req.user.supplierId,
      { phoneNumber, email, name }
    );
    
    successResponse(res, "Manager invitation sent successfully", invitation, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const inviteCoach = async (req, res) => {
  try {
    const { academyId } = req.params;
    const coachData = req.body;
    
    const invitation = await academyService.inviteCoach(
      academyId,
      req.user.supplierId,
      coachData
    );
    
    successResponse(res, "Coach invitation sent successfully", invitation, 201);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { invitationToken } = req.params;
    
    const invitation = await academyService.acceptInvitation(
      invitationToken,
      req.user.supplierId
    );
    
    successResponse(res, "Invitation accepted successfully", invitation);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { invitationToken } = req.params;
    
    const invitation = await academyService.rejectInvitation(
      invitationToken,
      req.user.supplierId
    );
    
    successResponse(res, "Invitation rejected successfully", invitation);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getSupplierInvitations = async (req, res) => {
  try {
    const { status } = req.query;
    
    const invitations = await academyService.getSupplierInvitations(
      req.user.supplierId,
      status
    );
    
    successResponse(res, "Invitations fetched successfully", invitations);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

const getManagingAcademies = async (req, res) => {
  try {
    // Get academies where user is manager
    const managingAcademies = await AcademyProfile.findAll({
      where: { 
        managerId: req.user.supplierId,
        invitationStatus: 'accepted'
      },
      attributes: [
        'academyId', 
        'name', 
        'description', 
        'photos',
        'sports',
        'managerAcceptedAt'
      ]
    });
    
    successResponse(res, "Managing academies fetched successfully", managingAcademies);
  } catch (error) {
    errorResponse(res, error.message, error);
  }
};

module.exports = {
  inviteManager,
  inviteCoach,
  acceptInvitation,
  rejectInvitation,
  getSupplierInvitations,
  getManagingAcademies
};