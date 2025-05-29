const {
  AUTO_ACHIEVEMENT_RULES,
  SPORTS_SCORING_FLAGS,
} = require("../../constants/scoreConstants");
const { v4: uuidv4 } = require("uuid");

class AchievementService {
  async processAutoAchievements(
    studentId,
    studentType,
    newScores,
    scoreHistory = []
  ) {
    const achievements = [];

    try {
      // Process each auto-achievement rule
      for (const [ruleKey, rule] of Object.entries(AUTO_ACHIEVEMENT_RULES)) {
        if (rule.condition(newScores, scoreHistory)) {
          // Check if student already has this achievement
          const hasAchievement = await this.hasAchievement(
            studentId,
            studentType,
            rule.flag
          );

          if (!hasAchievement) {
            const achievement = await this.awardAchievement(
              studentId,
              studentType,
              {
                type: rule.flag,
                name: rule.name,
                description: rule.description,
                sport: newScores.sport || "general",
                level: this.determineAchievementLevel(newScores),
                autoAwarded: true,
                awardedDate: new Date().toISOString(),
              }
            );

            achievements.push(achievement);
          }
        }
      }

      // Process sport-specific achievements
      if (newScores.sport && SPORTS_SCORING_FLAGS[newScores.sport]) {
        const sportAchievements = await this.processSportSpecificAchievements(
          studentId,
          studentType,
          newScores,
          scoreHistory
        );
        achievements.push(...sportAchievements);
      }

      return achievements;
    } catch (error) {
      console.error("Error processing auto achievements:", error);
      return [];
    }
  }

  async processSportSpecificAchievements(
    studentId,
    studentType,
    newScores,
    scoreHistory
  ) {
    const achievements = [];
    const sport = newScores.sport;
    const sportConfig = SPORTS_SCORING_FLAGS[sport];

    // Check for category excellence
    if (newScores.breakdown) {
      for (const [category, score] of Object.entries(newScores.breakdown)) {
        if (score >= 9.0) {
          const achievementType = `${category}_excellence`;
          const hasAchievement = await this.hasAchievement(
            studentId,
            studentType,
            achievementType
          );

          if (!hasAchievement) {
            achievements.push(
              await this.awardAchievement(studentId, studentType, {
                type: achievementType,
                name: `${
                  category.charAt(0).toUpperCase() + category.slice(1)
                } Excellence`,
                description: `Achieved excellence in ${category} (9.0+)`,
                sport,
                level: "gold",
                autoAwarded: true,
                awardedDate: new Date().toISOString(),
              })
            );
          }
        }
      }
    }

    // Check for first-time achievements
    if (scoreHistory.length === 0) {
      const firstScoreType = `first_${sport}_score`;
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: firstScoreType,
          name: `First ${sport.charAt(0).toUpperCase() + sport.slice(1)} Score`,
          description: `Received first scoring assessment in ${sport}`,
          sport,
          level: "bronze",
          autoAwarded: true,
          awardedDate: new Date().toISOString(),
        })
      );
    }

    // Check for milestone achievements
    if (
      newScores.overall >= 5.0 &&
      !(await this.hasAchievement(
        studentId,
        studentType,
        `${sport}_milestone_5`
      ))
    ) {
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: `${sport}_milestone_5`,
          name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Achiever`,
          description: `Reached 5.0 overall score in ${sport}`,
          sport,
          level: "bronze",
          autoAwarded: true,
          awardedDate: new Date().toISOString(),
        })
      );
    }

    if (
      newScores.overall >= 7.0 &&
      !(await this.hasAchievement(
        studentId,
        studentType,
        `${sport}_milestone_7`
      ))
    ) {
      achievements.push(
        await this.awardAchievement(studentId, studentType, {
          type: `${sport}_milestone_7`,
          name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Performer`,
          description: `Reached 7.0 overall score in ${sport}`,
          sport,
          level: "silver",
          autoAwarded: true,
          awardedDate: new Date().toISOString(),
        })
      );
    }

    return achievements;
  }

  async awardAchievement(studentId, studentType, achievement) {
    const { sequelize } = require("../../database");

    const achievementData = {
      id: uuidv4(),
      type: achievement.type,
      name: achievement.name,
      description: achievement.description,
      earnedDate: achievement.awardedDate || new Date().toISOString(),
      sport: achievement.sport || "general",
      level: achievement.level || "bronze",
      autoAwarded: achievement.autoAwarded || false,
      metadata: achievement.metadata || {},
    };

    if (studentType === "coach") {
      // Update CoachStudent achievement flags
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });

      if (coachStudent) {
        const updatedFlags = [
          ...(coachStudent.achievementFlags || []),
          achievement.type,
        ];
        await coachStudent.update({ achievementFlags: updatedFlags });
      }
    } else if (studentType === "academy") {
      // Update AcademyStudent achievement badges
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      if (academyStudent) {
        const updatedBadges = [
          ...(academyStudent.achievementBadges || []),
          achievementData,
        ];
        await academyStudent.update({ achievementBadges: updatedBadges });
      }
    }

    return achievementData;
  }

  async hasAchievement(studentId, studentType, achievementType) {
    const { sequelize } = require("../../database");

    if (studentType === "coach") {
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });

      return coachStudent?.achievementFlags?.includes(achievementType) || false;
    } else if (studentType === "academy") {
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      const badges = academyStudent?.achievementBadges || [];
      return badges.some((badge) => badge.type === achievementType);
    }

    return false;
  }

  determineAchievementLevel(scores) {
    const overall = scores.overall || 0;

    if (overall >= 9.5) return "platinum";
    if (overall >= 8.5) return "gold";
    if (overall >= 7.0) return "silver";
    return "bronze";
  }

  async getStudentAchievements(studentId, studentType) {
    const { sequelize } = require("../../database");

    if (studentType === "coach") {
      const coachStudent = await sequelize.models.CoachStudent.findOne({
        where: { userId: studentId },
      });

      return coachStudent?.achievementFlags || [];
    } else if (studentType === "academy") {
      const academyStudent = await sequelize.models.AcademyStudent.findByPk(
        studentId
      );

      return academyStudent?.achievementBadges || [];
    }

    return [];
  }

  async generateAchievementReport(entityType, entityId) {
    const { sequelize } = require("../../database");

    let students = [];

    if (entityType === "batch") {
      // Get students from batch
      const batchStudents = await sequelize.models.CoachStudent.findAll({
        where: { batchId: entityId },
        include: [
          {
            model: sequelize.models.User,
            as: "student",
            attributes: ["userId", "first_name", "last_name"],
          },
        ],
      });

      students = batchStudents.map((s) => ({
        studentId: s.userId,
        name: `${s.student.first_name} ${s.student.last_name}`,
        achievements: s.achievementFlags || [],
        studentType: "coach",
      }));
    } else if (entityType === "program") {
      // Get students from program
      const programStudents = await sequelize.models.AcademyStudent.findAll({
        where: { programId: entityId },
      });

      students = programStudents.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        achievements: s.achievementBadges || [],
        studentType: "academy",
      }));
    }

    // Aggregate achievement statistics
    const achievementStats = {};
    const totalStudents = students.length;

    students.forEach((student) => {
      student.achievements.forEach((achievement) => {
        const type =
          typeof achievement === "string" ? achievement : achievement.type;
        if (!achievementStats[type]) {
          achievementStats[type] = { count: 0, percentage: 0 };
        }
        achievementStats[type].count++;
      });
    });

    // Calculate percentages
    Object.keys(achievementStats).forEach((type) => {
      achievementStats[type].percentage =
        totalStudents > 0
          ? ((achievementStats[type].count / totalStudents) * 100).toFixed(1)
          : 0;
    });

    return {
      entityType,
      entityId,
      totalStudents,
      achievementStats,
      topAchievers: students
        .map((s) => ({
          ...s,
          achievementCount: Array.isArray(s.achievements)
            ? s.achievements.length
            : 0,
        }))
        .sort((a, b) => b.achievementCount - a.achievementCount)
        .slice(0, 5),
    };
  }
}

module.exports = new AchievementService();
