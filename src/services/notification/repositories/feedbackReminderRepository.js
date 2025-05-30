const {
  FeedbackReminder,
  AcademyStudent,
  CoachStudent,
  AcademyCoach,
  CoachProfile,
  AcademyBatch,
  AcademyProgram,
  sequelize,
} = require("../../../database");
const { Op } = require("sequelize");

class FeedbackReminderRepository {
  async generateFeedbackRemindersForBatch(batchId) {
    const students = await AcademyStudent.findAll({
      where: { batchId },
      include: [{ model: AcademyBatch, as: "batch" }],
    });

    const coaches = await sequelize.query(
      `
      SELECT ac.* FROM "AcademyCoach" ac
      JOIN "AcademyCoachBatches" acb ON ac.id = acb."academyCoachId"
      WHERE acb."batchId" = :batchId
    `,
      {
        replacements: { batchId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const reminders = [];

    for (const student of students) {
      for (const coach of coaches) {
        reminders.push({
          reminderId: require("uuid").v4(),
          coachId: coach.id,
          studentId: student.studentId,
          batchId: batchId,
          academyId: student.academyId,
          type: "batch_feedback",
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          status: "pending",
          priority: "medium",
        });
      }
    }

    return await FeedbackReminder.bulkCreate(reminders);
  }

  async generateFeedbackRemindersForProgram(programId) {
    const students = await AcademyStudent.findAll({
      where: { programId },
      include: [{ model: AcademyProgram, as: "program" }],
    });

    const coaches = await sequelize.query(
      `
      SELECT ac.* FROM "AcademyCoach" ac
      JOIN "AcademyCoachPrograms" acp ON ac.id = acp."academyCoachId"
      WHERE acp."programId" = :programId
    `,
      {
        replacements: { programId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const reminders = [];

    for (const student of students) {
      for (const coach of coaches) {
        reminders.push({
          reminderId: require("uuid").v4(),
          coachId: coach.id,
          studentId: student.studentId,
          programId: programId,
          academyId: student.academyId,
          type: "program_feedback",
          dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
          status: "pending",
          priority: "medium",
        });
      }
    }

    return await FeedbackReminder.bulkCreate(reminders);
  }

  async getOverdueReminders() {
    return await FeedbackReminder.findAll({
      where: {
        status: "pending",
        dueDate: {
          [Op.lt]: new Date(),
        },
      },
      include: [
        { model: AcademyCoach, as: "academyCoach" }
      ],
    });
  }

  async markReminderCompleted(reminderId, feedbackData = null) {
    const updateData = {
      status: "completed",
      completedAt: new Date(),
    };

    if (feedbackData) {
      updateData.feedbackData = feedbackData;
    }

    return await FeedbackReminder.update(updateData, {
      where: { reminderId },
    });
  }

  async escalateReminder(reminderId, escalationLevel = 1) {
    return await FeedbackReminder.update(
      {
        escalationLevel,
        priority: escalationLevel > 2 ? "high" : "medium",
        lastEscalatedAt: new Date(),
      },
      {
        where: { reminderId },
      }
    );
  }
}

module.exports = new FeedbackReminderRepository();
