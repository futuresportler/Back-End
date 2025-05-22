const { 
  CoachReview, 
  CoachProfile, 
  AcademyCoach, 
  User, 
  sequelize 
} = require("../../../database");

/**
 * Get feedback for all coaches in an academy
 */
const getAcademyCoachFeedback = async (academyId) => {
  const feedback = await sequelize.query(`
    SELECT 
      cr."reviewId" as id,
      cp."coachId",
      cp."name" as "coachName",
      u."first_name" || ' ' || u."last_name" as "studentName",
      cr."rating",
      cr."comment",
      cr."createdAt"
    FROM 
      "CoachReviews" cr
    JOIN 
      "CoachProfiles" cp ON cr."coachId" = cp."coachId"
    JOIN 
      "Users" u ON cr."userId" = u."userId"
    JOIN 
      "AcademyCoaches" ac ON cp."coachId" = ac."coachId"
    WHERE 
      ac."academyId" = :academyId
      AND cr."isPublic" = true
    ORDER BY 
      cr."createdAt" DESC
  `, {
    replacements: { academyId },
    type: sequelize.QueryTypes.SELECT
  });
  
  return feedback;
};

module.exports = {
  getAcademyCoachFeedback
};