const { AcademyInvitation, AcademyProfile, Supplier, AcademyCoach } = require("../../database");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const SupplierRepository = require("../supplier/repositories/supplierRepository");
const notificationService = require("../notification/notificationService");

class AcademyInvitationService {
  
  // Generate secure invitation token
  generateInvitationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Invite manager to academy
  async inviteManager(academyId, inviterSupplierId, managerData) {
    const { phoneNumber, email, name } = managerData;
    
    // Check if academy exists and inviter is owner
    const academy = await AcademyProfile.findByPk(academyId);
    if (!academy) {
      throw new Error("Academy not found");
    }
    
    if (academy.supplierId !== inviterSupplierId) {
      throw new Error("Only academy owner can invite managers");
    }

    // Check if supplier exists with phone number
    let existingSupplier = null;
    try {
      existingSupplier = await SupplierRepository.findSupplierByMobile(phoneNumber);
    } catch (error) {
      // Supplier doesn't exist, we'll create one
    }

    let inviteeSupplierId = null;
    
    if (existingSupplier) {
      inviteeSupplierId = existingSupplier.supplierId;
    } else {
      // Create unverified supplier account
      const newSupplier = await SupplierRepository.createSupplier({
        supplierId: uuidv4(),
        mobile_number: phoneNumber,
        email: email,
        name: name,
        isVerified: false,
        role: 'manager',
        module: ['academy']
      }, false); // Don't require verification yet
      
      inviteeSupplierId = newSupplier.supplierId;
    }

    // Create invitation
    const invitation = await AcademyInvitation.create({
      invitationId: uuidv4(),
      academyId,
      inviterSupplierId,
      inviteeSupplierId,
      inviteePhoneNumber: phoneNumber,
      inviteeEmail: email,
      role: 'manager',
      invitationToken: this.generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      metadata: { inviteeName: name }
    });

    // Update academy with manager info and pending status
    await academy.update({
      managerId: inviteeSupplierId,
      invitationStatus: 'pending',
      managerInvitedAt: new Date()
    });

    // Send notification
    await this.sendInvitationNotification(invitation, academy, 'manager');

    return invitation;
  }

  // Invite coach to academy
  async inviteCoach(academyId, inviterSupplierId, coachData) {
    const { phoneNumber, email, name, bio, specialization } = coachData;
    
    // Check if academy exists and inviter has permission
    const academy = await AcademyProfile.findByPk(academyId);
    if (!academy) {
      throw new Error("Academy not found");
    }
    
    // Check if inviter is owner or manager
    if (academy.supplierId !== inviterSupplierId && academy.managerId !== inviterSupplierId) {
      throw new Error("Only academy owner or manager can invite coaches");
    }

    // Check if supplier exists with phone number
    let existingSupplier = null;
    try {
      existingSupplier = await SupplierRepository.findSupplierByMobile(phoneNumber);
    } catch (error) {
      // Supplier doesn't exist
    }

    let inviteeSupplierId = null;
    
    if (existingSupplier) {
      inviteeSupplierId = existingSupplier.supplierId;
    } else {
      // Create unverified supplier account
      const newSupplier = await SupplierRepository.createSupplier({
        supplierId: uuidv4(),
        mobile_number: phoneNumber,
        email: email,
        name: name,
        isVerified: false,
        role: 'coach',
        module: ['coach']
      }, false);
      
      inviteeSupplierId = newSupplier.supplierId;
    }

    // Create invitation
    const invitation = await AcademyInvitation.create({
      invitationId: uuidv4(),
      academyId,
      inviterSupplierId,
      inviteeSupplierId,
      inviteePhoneNumber: phoneNumber,
      inviteeEmail: email,
      role: 'coach',
      invitationToken: this.generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      metadata: { 
        inviteeName: name,
        bio,
        specialization
      }
    });

    // Create academy coach record with pending status
    await AcademyCoach.create({
      id: uuidv4(),
      academyId,
      name,
      mobileNumber: phoneNumber,
      email,
      bio,
      sport: specialization?.[0] || 'General',
      supplierId: inviteeSupplierId,
      invitationStatus: 'pending',
      invitedAt: new Date(),
      invitationToken: invitation.invitationToken
    });

    // Send notification
    await this.sendInvitationNotification(invitation, academy, 'coach');

    return invitation;
  }

  // Accept invitation
  async acceptInvitation(invitationToken, supplierId) {
    const invitation = await AcademyInvitation.findOne({
      where: { invitationToken, status: 'pending' },
      include: [
        { model: AcademyProfile, as: 'academy' }
      ]
    });

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    if (invitation.expiresAt < new Date()) {
      await invitation.update({ status: 'expired' });
      throw new Error("Invitation has expired");
    }

    if (invitation.inviteeSupplierId !== supplierId) {
      throw new Error("Unauthorized to accept this invitation");
    }

    // Update invitation status
    await invitation.update({
      status: 'accepted',
      acceptedAt: new Date()
    });

    if (invitation.role === 'manager') {
      // Update academy
      await AcademyProfile.update({
        invitationStatus: 'accepted',
        managerAcceptedAt: new Date()
      }, {
        where: { academyProfileId: invitation.academyId }
      });
    } else if (invitation.role === 'coach') {
      // Update academy coach
      await AcademyCoach.update({
        invitationStatus: 'accepted',
        acceptedAt: new Date()
      }, {
        where: { 
          academyId: invitation.academyId,
          invitationToken: invitationToken
        }
      });
    }

    // Send acceptance notification to academy owner
    await this.sendAcceptanceNotification(invitation);

    return invitation;
  }

  // Reject invitation
  async rejectInvitation(invitationToken, supplierId) {
    const invitation = await AcademyInvitation.findOne({
      where: { invitationToken, status: 'pending' }
    });

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    if (invitation.inviteeSupplierId !== supplierId) {
      throw new Error("Unauthorized to reject this invitation");
    }

    // Update invitation status
    await invitation.update({
      status: 'rejected',
      rejectedAt: new Date()
    });

    if (invitation.role === 'manager') {
      // Remove manager from academy
      await AcademyProfile.update({
        managerId: null,
        invitationStatus: null,
        managerInvitedAt: null
      }, {
        where: { academyProfileId: invitation.academyId }
      });
    } else if (invitation.role === 'coach') {
      // Remove academy coach record
      await AcademyCoach.destroy({
        where: { 
          academyId: invitation.academyId,
          invitationToken: invitationToken
        }
      });
    }

    // Send rejection notification to academy owner
    await this.sendRejectionNotification(invitation);

    return invitation;
  }

  // Get supplier invitations
  async getSupplierInvitations(supplierId, status = null) {
    const where = { inviteeSupplierId: supplierId };
    if (status) {
      where.status = status;
    }

    return await AcademyInvitation.findAll({
      where,
      include: [
        { 
          model: AcademyProfile, 
          as: 'academy',
          attributes: ['academyId', 'name', 'description', 'photos'] // Changed from academyProfileId to academyId and academy_name to name
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Send invitation notification
  async sendInvitationNotification(invitation, academy, role) {
    const message = `You've been invited to join ${academy.name} as a ${role}. Please check your app to accept or reject this invitation.`;
    
    // Create app notification
    try {
      await notificationService.createNotification(
        invitation.inviteeSupplierId,
        'supplier',
        {
          type: `academy_${role}_invitation`,
          title: `${role.charAt(0).toUpperCase() + role.slice(1)} Invitation`,
          message,
          data: {
            academyId: invitation.academyId,
            academyName: academy.name,
            invitationId: invitation.invitationId,
            invitationToken: invitation.invitationToken,
            role
          },
          priority: 'high'
        }
      );
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    // Send WhatsApp notification
    try {
      await notificationService.sendWhatsAppNotification(
        invitation.inviteePhoneNumber,
        message
      );
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }
  }

  // Send acceptance notification
  async sendAcceptanceNotification(invitation) {
    const academy = await AcademyProfile.findByPk(invitation.academyId);
    const message = `${invitation.metadata.inviteeName} has accepted your invitation to join ${academy.name} as ${invitation.role}.`;
    
    await notificationService.createNotification(
      invitation.inviterSupplierId,
      'supplier',
      {
        type: 'invitation_accepted',
        title: 'Invitation Accepted',
        message,
        data: {
          academyId: invitation.academyId,
          invitationId: invitation.invitationId,
          role: invitation.role,
          inviteeName: invitation.metadata.inviteeName
        },
        priority: 'medium'
      }
    );
  }

  // Send rejection notification
  async sendRejectionNotification(invitation) {
    const academy = await AcademyProfile.findByPk(invitation.academyId);
    const message = `${invitation.metadata.inviteeName} has declined your invitation to join ${academy.name} as ${invitation.role}.`;
    
    await notificationService.createNotification(
      invitation.inviterSupplierId,
      'supplier',
      {
        type: 'invitation_rejected',
        title: 'Invitation Declined',
        message,
        data: {
          academyId: invitation.academyId,
          invitationId: invitation.invitationId,
          role: invitation.role,
          inviteeName: invitation.metadata.inviteeName
        },
        priority: 'medium'
      }
    );
  }
}

module.exports = new AcademyInvitationService();