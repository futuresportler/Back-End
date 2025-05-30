const SCORE_CONFIG = {
  // Default scoring weights for overall calculation
  DEFAULT_WEIGHTS: {
    technique: 0.3,
    fitness: 0.25,
    teamwork: 0.25,
    gameUnderstanding: 0.2,
  },

  // Sport-specific weights (override defaults)
  SPORT_WEIGHTS: {
    football: {
      technique: 0.35,
      fitness: 0.25,
      teamwork: 0.25,
      gameUnderstanding: 0.15,
    },
    basketball: {
      technique: 0.3,
      fitness: 0.3,
      teamwork: 0.2,
      gameUnderstanding: 0.2,
    },
    cricket: {
      technique: 0.4,
      fitness: 0.2,
      teamwork: 0.2,
      gameUnderstanding: 0.2,
    },
    tennis: {
      technique: 0.35,
      fitness: 0.25,
      mental: 0.25,
      gameUnderstanding: 0.15,
    },
    swimming: {
      technique: 0.4,
      fitness: 0.3,
      mental: 0.15,
      performance: 0.15,
    },
  },

  // Auto-achievement thresholds
  ACHIEVEMENT_THRESHOLDS: {
    EXCELLENCE_SCORE: 8.5,
    RAPID_IMPROVEMENT: 2.0,
    CONSISTENCY_MONTHS: 3,
    CONSISTENCY_THRESHOLD: 7.0,
  },

  // Analytics settings
  ANALYTICS: {
    DEFAULT_HISTORY_MONTHS: 6,
    MAX_HISTORY_MONTHS: 24,
    MIN_DATA_POINTS_FOR_TRENDS: 3,
    TOP_PERFORMERS_LIMIT: 10,
  },

  // Score update settings
  UPDATE_SETTINGS: {
    REQUIRE_METHODOLOGY: true,
    ALLOW_RETROACTIVE_UPDATES: false,
    MAX_RETROACTIVE_DAYS: 7,
    REQUIRE_JUSTIFICATION_FOR_MAJOR_CHANGES: true,
    MAJOR_CHANGE_THRESHOLD: 2.0,
  },

  // Notification settings for score updates
  NOTIFICATIONS: {
    NOTIFY_ON_ACHIEVEMENT: true,
    NOTIFY_ON_MAJOR_IMPROVEMENT: true,
    NOTIFY_ON_DECLINE: true,
    ACHIEVEMENT_NOTIFICATION_DELAY_MS: 5000,
  },
};

module.exports = SCORE_CONFIG;
