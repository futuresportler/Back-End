const scoreService = require("./scoreService");
const scoreRepository = require("./repositories/scoreRepository");

module.exports = {
  scoreService,
  scoreRepository,

  // Main Score Service methods
  updateStudentScore: scoreService.updateStudentScore.bind(scoreService),
  bulkUpdateScores: scoreService.bulkUpdateScores.bind(scoreService),
  getStudentScoreAnalytics:
    scoreService.getStudentScoreAnalytics.bind(scoreService),
  getBatchScoreAnalytics:
    scoreService.getBatchScoreAnalytics.bind(scoreService),
  getProgramScoreAnalytics:
    scoreService.getProgramScoreAnalytics.bind(scoreService),
  getCoachEffectivenessReport:
    scoreService.getCoachEffectivenessReport.bind(scoreService),

  // Achievement System
  awardAchievement: scoreService.awardAchievement.bind(scoreService),
  checkAndAwardAutoAchievements:
    scoreService.checkAndAwardAutoAchievements.bind(scoreService),

  // Repository methods
  updateStudentScores:
    scoreRepository.updateStudentScores.bind(scoreRepository),
  updateBatchScoreMetrics:
    scoreRepository.updateBatchScoreMetrics.bind(scoreRepository),
  updateCoachEffectiveness:
    scoreRepository.updateCoachEffectiveness.bind(scoreRepository),
  updateProgramScoreMetrics:
    scoreRepository.updateProgramScoreMetrics.bind(scoreRepository),
  getStudentScoreHistory:
    scoreRepository.getStudentScoreHistory.bind(scoreRepository),
  getTopPerformers: scoreRepository.getTopPerformers.bind(scoreRepository),
  getScoreDistribution:
    scoreRepository.getScoreDistribution.bind(scoreRepository),
};
