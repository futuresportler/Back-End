const {
  AcademyCoach,
  CoachProfile,
  AcademyBatch,
  AcademyProgram,
  AcademyCoachBatch,
  AcademyCoachProgram,
  Supplier,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

class AcademyCoachRepository {
  async createCoach(coachData) {
    return await AcademyCoach.create(coachData);
  }

  async findCoachById(coachId) {
    return await AcademyCoach.findByPk(coachId, {
      include: [
        {
          model: CoachProfile,
          as: "platformCoach",
          required: false,
          include: [
            {
              model: Supplier,
              as: "supplier",
              required: false,
            },
          ],
        },
      ],
    });
  }

  async findCoachesByAcademy(academyId, filters = {}) {
    const where = { academyId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.sport) {
      where.sport = filters.sport;
    }

    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const { count, rows } = await AcademyCoach.findAndCountAll({
      where,
      include: [
        {
          model: CoachProfile,
          as: "platformCoach",
          required: false,
          include: [
            {
              model: Supplier,
              as: "supplier",
              required: false,
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return {
      coaches: rows,
      pagination: {
        total: count,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    };
  }

  async updateCoach(coachId, updateData) {
    const coach = await AcademyCoach.findByPk(coachId);
    if (!coach) return null;
    return await coach.update(updateData);
  }

  async deleteCoach(coachId) {
    const coach = await AcademyCoach.findByPk(coachId);
    if (!coach) return null;
    await coach.destroy();
    return coach;
  }

  async findByMobileNumber(mobileNumber) {
    return await AcademyCoach.findAll({
      where: { mobileNumber },
    });
  }

  async findPlatformCoachByMobile(mobileNumber) {
    return await CoachProfile.findOne({
      include: [
        {
          model: Supplier,
          as: "supplier",
          where: { mobile_number: mobileNumber },
        },
      ],
    });
  }

  async linkToPlatformCoach(academyCoachId, coachId) {
    return await this.updateCoach(academyCoachId, { coachId });
  }

  async syncWithPlatformCoach(academyCoachId, platformCoachData) {
    const updateData = {
      name: platformCoachData.supplier?.name || platformCoachData.name,
      email: platformCoachData.supplier?.email,
      bio: platformCoachData.bio,
      hourlyRate: platformCoachData.hourlyRate,
      profilePicture: platformCoachData.supplier?.profilePicture,
      isVerified: true,
    };

    return await this.updateCoach(academyCoachId, updateData);
  }

  // Batch and Program assignment methods
  async assignToBatch(coachId, batchId, isPrimary = false) {
    try {
      // Check if assignment already exists
      const existing = await AcademyCoachBatch.findOne({
        where: { academyCoachId: coachId, batchId },
      });

      if (existing) {
        throw new Error("Coach is already assigned to this batch");
      }

      return await AcademyCoachBatch.create({
        academyCoachId: coachId,
        batchId,
        isPrimary,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Coach is already assigned to this batch");
      }
      throw error;
    }
  }

  async removeFromBatch(coachId, batchId) {
    return await AcademyCoachBatch.destroy({
      where: {
        academyCoachId: coachId,
        batchId,
      },
    });
  }

  async assignToProgram(coachId, programId, isPrimary = false) {
    try {
      // Check if assignment already exists
      const existing = await AcademyCoachProgram.findOne({
        where: { academyCoachId: coachId, programId },
      });

      if (existing) {
        throw new Error("Coach is already assigned to this program");
      }

      return await AcademyCoachProgram.create({
        academyCoachId: coachId,
        programId,
        isPrimary,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error("Coach is already assigned to this program");
      }
      throw error;
    }
  }

  async removeFromProgram(coachId, programId) {
    return await AcademyCoachProgram.destroy({
      where: {
        academyCoachId: coachId,
        programId,
      },
    });
  }

  async getCoachBatches(coachId) {
    try {
      const assignments = await AcademyCoachBatch.findAll({
        where: { academyCoachId: coachId },
        include: [
          {
            model: AcademyBatch,
            as: "batch",
            required: true,
          },
        ],
      });

      return assignments.map((assignment) => ({
        batchId: assignment.batch.batchId,
        batchName: assignment.batch.batchName,
        startTime: assignment.batch.startTime,
        endTime: assignment.batch.endTime,
        daysOfWeek: assignment.batch.daysOfWeek,
        sport: assignment.batch.sport,
        ageGroup: assignment.batch.ageGroup,
        isPrimary: assignment.isPrimary,
        assignedDate: assignment.assignedDate,
      }));
    } catch (error) {
      console.error("Error fetching coach batches:", error);
      return [];
    }
  }

  async getCoachPrograms(coachId) {
    try {
      const assignments = await AcademyCoachProgram.findAll({
        where: { academyCoachId: coachId },
        include: [
          {
            model: AcademyProgram,
            as: "program",
            required: true,
          },
        ],
      });

      return assignments.map((assignment) => ({
        programId: assignment.program.programId,
        programName: assignment.program.programName,
        sport: assignment.program.sport,
        ageGroup: assignment.program.ageGroup,
        isPrimary: assignment.isPrimary,
        assignedDate: assignment.assignedDate,
      }));
    } catch (error) {
      console.error("Error fetching coach programs:", error);
      return [];
    }
  }

  async getCoachSchedule(coachId) {
    const coach = await AcademyCoach.findByPk(coachId, {
      attributes: ["id", "name", "schedule"],
    });

    if (!coach) return null;

    const [batches, programs] = await Promise.all([
      this.getCoachBatches(coachId),
      this.getCoachPrograms(coachId),
    ]);

    return {
      id: coach.id,
      name: coach.name,
      schedule: coach.schedule,
      batches,
      programs,
    };
  }
}

module.exports = new AcademyCoachRepository();
