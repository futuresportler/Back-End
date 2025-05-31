const { v4: uuidv4 } = require("uuid");
const academyCoachRepository = require("./repositories/academyCoachRepository");
const academyRepository = require("./repositories/academyRepository");
const { CoachProfile, Supplier, sequelize, AcademyStudent, AcademyBatch , AcademyProgram} = require("../../database");
const coachProfileRepository = require("../supplier/repositories/coachProfileRepository");
const scoreService = require("../score/scoreService");
const { Op } = require("sequelize");

class AcademyCoachService {
  async createCoach(academyId, coachData) {
    const coach = await academyCoachRepository.createCoach({
      id: uuidv4(),
      academyId,
      ...coachData,
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
    return await academyCoachRepository.findCoachesByAcademy(
      academyId,
      filters
    );
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
    const platformCoach =
      await academyCoachRepository.findPlatformCoachByMobile(
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
      const academy = await academyRepository.findAcademyProfileById(
        academyCoach.academyId
      );

      // First create supplier
      const supplier = await Supplier.create({
        supplierId: uuidv4(),
        name: academyCoach.name,
        email: academyCoach.email,
        mobile_number: academyCoach.mobileNumber,
        role: "coach",
        module: ["coach"],
        isVerified: false,
      });

      // Then create coach profile
      const coachProfile = await coachProfileRepository.createCoachProfile({
        supplierId: supplier.supplierId,
        bio: academyCoach.bio,
        hourlyRate: academyCoach.hourlyRate,
        experienceYears: Number.parseInt(academyCoach.experienceLevel) || 1,
        sportsCoached: [academyCoach.sport],
        city: academy?.location || "Unknown",
        isVerified: false,
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
    return await academyCoachRepository.assignToBatch(
      coachId,
      batchId,
      isPrimary
    );
  }

  async removeFromBatch(coachId, batchId) {
    return await academyCoachRepository.removeFromBatch(coachId, batchId);
  }

  async assignToProgram(coachId, programId, isPrimary = false) {
    return await academyCoachRepository.assignToProgram(
      coachId,
      programId,
      isPrimary
    );
  }

  async removeFromProgram(coachId, programId) {
    return await academyCoachRepository.removeFromProgram(coachId, programId);
  }

  async getCoachBatchesAndPrograms(coachId) {
    const batches = await academyCoachRepository.getCoachBatches(coachId);
    const programs = await academyCoachRepository.getCoachPrograms(coachId);

    return {
      batches,
      programs,
    };
  }

  async getCoachSchedule(coachId) {
    const coachWithSchedule = await academyCoachRepository.getCoachSchedule(
      coachId
    );

    if (!coachWithSchedule) {
      throw new Error("Coach not found");
    }

    // Compile schedule from personal schedule, batches, and programs
    const schedule = {
      personal: coachWithSchedule.schedule || {},
      batches: coachWithSchedule.batches || [],
      programs: coachWithSchedule.programs || [],
    };

    return {
      coach: {
        id: coachWithSchedule.id,
        name: coachWithSchedule.name,
      },
      schedule,
    };
  }

  async syncAllCoachesWithPlatform(academyId) {
    const { coaches } = await academyCoachRepository.findCoachesByAcademy(
      academyId
    );

    for (const coach of coaches) {
      if (coach.mobileNumber && !coach.coachId) {
        await this.handlePlatformCoachLinking(coach);
      }
    }

    return { synced: coaches.length };
  }

  async updateStudentScore(coachId, studentId, scoreData) {
    try {
      // Verify coach has access to this student through batch or program
      const coach = await academyCoachRepository.findCoachById(coachId);
      if (!coach) {
        throw new Error("Coach not found");
      }

      // Check if student is in any of coach's batches or programs
      const hasAccess = await this.verifyStudentAccess(coachId, studentId);
      if (!hasAccess) {
        throw new Error("Coach does not have access to this student");
      }

      // Update scores using score service
      const result = await scoreService.updateStudentScore(
        studentId,
        "academy",
        scoreData,
        coachId,
        "academy_coach"
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to update student score: ${error.message}`);
    }
  }

  async verifyStudentAccess(coachId, studentId) {
    try {
      // Check if student is in any batch assigned to this coach
      const coachBatches = await academyCoachRepository.getCoachBatches(
        coachId
      );
      const batchIds = coachBatches.map((batch) => batch.batchId);

      if (batchIds.length > 0) {
        const studentInBatch = await AcademyStudent.findOne({
          where: {
            studentId,
            batchId: { [Op.in]: batchIds },
          },
        });

        if (studentInBatch) return true;
      }

      // Check if student is in any program assigned to this coach
      const coachPrograms = await academyCoachRepository.getCoachPrograms(
        coachId
      );
      const programIds = coachPrograms.map((program) => program.programId);

      if (programIds.length > 0) {
        const studentInProgram = await AcademyStudent.findOne({
          where: {
            studentId,
            programId: { [Op.in]: programIds },
          },
        });

        if (studentInProgram) return true;
      }

      return false;
    } catch (error) {
      console.error("Error verifying student access:", error);
      return false;
    }
  }

  async getMyStudentsWithScores(coachId, filters = {}) {
    // Get all batches and programs for this coach
    const [batches, programs] = await Promise.all([
      academyCoachRepository.getCoachBatches(coachId),
      academyCoachRepository.getCoachPrograms(coachId),
    ]);

    const batchIds = batches.map((b) => b.batchId);
    const programIds = programs.map((p) => p.programId);

    const where = {
      [Op.or]: [
        ...(batchIds.length > 0 ? [{ batchId: { [Op.in]: batchIds } }] : []),
        ...(programIds.length > 0
          ? [{ programId: { [Op.in]: programIds } }]
          : []),
      ],
    };

    if (filters.sport) {
      where.sport = filters.sport;
    }

    const students = await AcademyStudent.findAll({
      where,
      attributes: [
        "studentId",
        "name",
        "sport",
        "currentScores",
        "achievementBadges",
        "scoreTrends",
        "batchId",
        "programId",
      ],
      include: [
        {
          model: AcademyBatch,
          as: "batch",
          attributes: ["batchId", "batchName"],
          required: false,
        },
        {
          model: AcademyProgram,
          as: "program",
          attributes: ["programId", "programName"],
          required: false,
        },
      ],
      order: [
        [
          sequelize.literal(`("currentScores"->>'overall')::float`),
          "DESC NULLS LAST",
        ],
      ],
    });

    return students;
  }

  async bulkUpdateStudentScores(coachId, studentsScoreData) {
    // Verify coach has access to all students
    const studentIds = studentsScoreData.map((s) => s.studentId);

    for (const studentId of studentIds) {
      const hasAccess = await this.verifyStudentAccess(coachId, studentId);
      if (!hasAccess) {
        throw new Error(`Coach does not have access to student ${studentId}`);
      }
    }

    // Prepare data for bulk update
    const studentsData = studentsScoreData.map((studentScore) => ({
      studentId: studentScore.studentId,
      studentType: "academy",
      scoreData: studentScore.scoreData,
    }));

    return await scoreService.bulkUpdateScores(
      studentsData,
      coachId,
      "academy_coach"
    );
  }

  async getCoachScoreEffectiveness(coachId, monthId = null) {
    // Get effectiveness report from score service
    return await scoreService.getCoachEffectivenessReport(coachId, monthId);
  }

  async getBatchScoreAnalytics(coachId, batchId) {
    // Verify coach has access to this batch
    const coachBatches = await academyCoachRepository.getCoachBatches(coachId);
    const hasAccess = coachBatches.some((batch) => batch.batchId === batchId);

    if (!hasAccess) {
      throw new Error("Coach does not have access to this batch");
    }

    return await scoreService.getBatchScoreAnalytics(batchId);
  }

  async getProgramScoreAnalytics(coachId, programId) {
    // Verify coach has access to this program
    const coachPrograms = await academyCoachRepository.getCoachPrograms(
      coachId
    );
    const hasAccess = coachPrograms.some(
      (program) => program.programId === programId
    );

    if (!hasAccess) {
      throw new Error("Coach does not have access to this program");
    }

    return await scoreService.getProgramScoreAnalytics(programId);
  }

  async awardStudentAchievement(coachId, studentId, achievement) {
    // Verify coach has access to this student
    const hasAccess = await this.verifyStudentAccess(coachId, studentId);
    if (!hasAccess) {
      throw new Error("Coach does not have access to this student");
    }

    return await scoreService.awardAchievement(
      studentId,
      "academy",
      achievement
    );
  }
}

module.exports = new AcademyCoachService();
