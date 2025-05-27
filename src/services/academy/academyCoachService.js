const { v4: uuidv4 } = require("uuid");
const academyCoachRepository = require("./repositories/academyCoachRepository");
const { CoachProfile, Supplier } = require("../../database");
const coachProfileRepository = require("../supplier/repositories/coachProfileRepository");

class AcademyCoachService {

  async createCoach(academyId, coachData) {
    const coach = await academyCoachRepository.createCoach({
      id: uuidv4(),
      academyId,
      ...coachData
    });

    // Check for mobile number and handle platform coach linking
    if (coachData.mobileNumber) {
      await this.handlePlatformCoachLinking(coach);
    }

    return coach;
  }

  async getCoachById(coachId) {
    const coach = await academyCoachRepository.findCoachById(coachId);
    if (!coach) {
      throw new Error("Coach not found");
    }
    return coach;
  }

  async getCoachesByAcademy(academyId, filters = {}) {
    return await academyCoachRepository.findCoachesByAcademy(academyId, filters);
  }

  async updateCoach(coachId, updateData) {
    const coach = await academyCoachRepository.updateCoach(coachId, updateData);
    if (!coach) {
      throw new Error("Coach not found");
    }

    // Check for mobile number changes and handle platform coach linking
    if (updateData.mobileNumber) {
      await this.handlePlatformCoachLinking(coach);
    }

    return coach;
  }

  async deleteCoach(coachId) {
    const coach = await academyCoachRepository.deleteCoach(coachId);
    if (!coach) {
      throw new Error("Coach not found");
    }
    return coach;
  }

  async handlePlatformCoachLinking(academyCoach) {
    if (!academyCoach.mobileNumber) return;

    // Check if platform coach exists with this mobile number
    const platformCoach = await academyCoachRepository.findPlatformCoachByMobile(
      academyCoach.mobileNumber
    );

    if (platformCoach) {
      // Link existing platform coach
      await academyCoachRepository.linkToPlatformCoach(
        academyCoach.id, 
        platformCoach.coachId
      );
      
      // Sync details from platform coach
      await academyCoachRepository.syncWithPlatformCoach(
        academyCoach.id, 
        platformCoach
      );
    } else {
      // Create new platform coach profile
      await this.createPlatformCoachProfile(academyCoach);
    }
  }

  async createPlatformCoachProfile(academyCoach) {
    try {
        // Get academy location for better coach profile
        const academy = await academyRepository.findAcademyProfileById(academyCoach.academyId);
    
      // First create supplier
      const supplier = await Supplier.create({
        supplierId: uuidv4(),
        name: academyCoach.name,
        email: academyCoach.email,
        mobile_number: academyCoach.mobileNumber,
        role: "coach",
        module: ["coach"],
        isVerified: false
      });

      // Then create coach profile
      const coachProfile = await coachProfileRepository.createCoachProfile({
        supplierId: supplier.supplierId,
        bio: academyCoach.bio,
        hourlyRate: academyCoach.hourlyRate,
        experienceYears: parseInt(academyCoach.experienceLevel) || 1,
        sportsCoached: [academyCoach.sport],
        city:academy?.location || "Unknown", 
        isVerified: false
      });

      // Link the academy coach to the platform coach
      await academyCoachRepository.linkToPlatformCoach(
        academyCoach.id,
        coachProfile.coachId
      );

      return coachProfile;
    } catch (error) {
      console.error("Error creating platform coach profile:", error);
      // Don't throw error, just log it as this is a background operation
    }
  }

  async assignToBatch(coachId, batchId, isPrimary = false) {
    return await academyCoachRepository.assignToBatch(coachId, batchId, isPrimary);
  }

  async removeFromBatch(coachId, batchId) {
    return await academyCoachRepository.removeFromBatch(coachId, batchId);
  }

  async assignToProgram(coachId, programId, isPrimary = false) {
    return await academyCoachRepository.assignToProgram(coachId, programId, isPrimary);
  }

  async removeFromProgram(coachId, programId) {
    return await academyCoachRepository.removeFromProgram(coachId, programId);
  }

  async getCoachBatchesAndPrograms(coachId) {
    const batches = await academyCoachRepository.getCoachBatches(coachId);
    const programs = await academyCoachRepository.getCoachPrograms(coachId);
    
    return {
      batches,
      programs
    };
  }

  async getCoachSchedule(coachId) {
    const coachWithSchedule = await academyCoachRepository.getCoachSchedule(coachId);
    
    if (!coachWithSchedule) {
      throw new Error("Coach not found");
    }

    // Compile schedule from personal schedule, batches, and programs
    const schedule = {
      personal: coachWithSchedule.schedule || {},
      batches: coachWithSchedule.batches || [],
      programs: coachWithSchedule.programs || []
    };

    return {
      coach: {
        id: coachWithSchedule.id,
        name: coachWithSchedule.name
      },
      schedule
    };
  }

  async syncAllCoachesWithPlatform(academyId) {
    const { coaches } = await academyCoachRepository.findCoachesByAcademy(academyId);
    
    for (const coach of coaches) {
      if (coach.mobileNumber && !coach.coachId) {
        await this.handlePlatformCoachLinking(coach);
      }
    }

    return { synced: coaches.length };
  }
}

module.exports = new AcademyCoachService();