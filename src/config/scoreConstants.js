const SPORTS_SCORING_FLAGS = {
  football: {
    categories: ["technique", "fitness", "teamwork", "gameUnderstanding"],
    flags: [
      "first_goal", "hat_trick", "assist_master", "defensive_wall", 
      "captain_material", "fitness_beast", "technique_wizard", "team_player",
      "match_winner", "consistent_performer", "rapid_improvement", "leadership_badge"
    ],
    subCategories: {
      technique: ["passing", "shooting", "dribbling", "ball_control", "crossing"],
      fitness: ["stamina", "speed", "agility", "strength", "endurance"],
      teamwork: ["communication", "positioning", "support_play", "defensive_help"],
      gameUnderstanding: ["tactical_awareness", "decision_making", "game_reading", "adaptability"]
    }
  },
  basketball: {
    categories: ["technique", "fitness", "teamwork", "gameUnderstanding"],
    flags: [
      "first_basket", "three_point_specialist", "slam_dunk", "steal_master",
      "rebound_king", "assist_leader", "defensive_anchor", "clutch_player",
      "court_vision", "team_captain", "rapid_improvement", "consistency_award"
    ],
    subCategories: {
      technique: ["shooting", "dribbling", "passing", "defense", "rebounding"],
      fitness: ["stamina", "jumping", "speed", "agility", "coordination"],
      teamwork: ["ball_sharing", "screen_setting", "help_defense", "communication"],
      gameUnderstanding: ["court_awareness", "play_execution", "strategy", "timing"]
    }
  },
  cricket: {
    categories: ["technique", "fitness", "teamwork", "gameUnderstanding"],
    flags: [
      "first_wicket", "century_maker", "boundary_hitter", "dot_ball_specialist",
      "fielding_star", "bowling_ace", "captain_courageous", "match_saver",
      "all_rounder", "power_hitter", "rapid_improvement", "team_spirit"
    ],
    subCategories: {
      technique: ["batting", "bowling", "fielding", "wicket_keeping", "running"],
      fitness: ["stamina", "flexibility", "hand_eye_coordination", "reflexes"],
      teamwork: ["field_positioning", "communication", "partnership", "support"],
      gameUnderstanding: ["match_situation", "strategy", "pressure_handling", "adaptation"]
    }
  },
  tennis: {
    categories: ["technique", "fitness", "mental", "gameUnderstanding"],
    flags: [
      "first_ace", "rally_master", "net_dominator", "baseline_warrior",
      "service_ace", "return_specialist", "mental_strength", "comeback_king",
      "consistency_champion", "power_player", "rapid_improvement", "sportsmanship"
    ],
    subCategories: {
      technique: ["serve", "forehand", "backhand", "volley", "footwork"],
      fitness: ["stamina", "speed", "agility", "strength", "flexibility"],
      mental: ["focus", "pressure_handling", "confidence", "determination"],
      gameUnderstanding: ["strategy", "court_positioning", "shot_selection", "adaptation"]
    }
  },
  swimming: {
    categories: ["technique", "fitness", "mental", "performance"],
    flags: [
      "first_lap", "stroke_master", "speed_demon", "endurance_champion",
      "technique_perfect", "relay_star", "personal_best", "breathing_control",
      "dive_specialist", "turn_master", "rapid_improvement", "dedication_award"
    ],
    subCategories: {
      technique: ["stroke_technique", "breathing", "turns", "starts", "body_position"],
      fitness: ["cardiovascular", "strength", "flexibility", "endurance"],
      mental: ["focus", "rhythm", "confidence", "goal_setting"],
      performance: ["speed", "consistency", "improvement", "competition_readiness"]
    }
  }
};

const SCORE_RANGES = {
  EXCELLENT: { min: 8.5, max: 10, label: "Excellent", color: "#4CAF50" },
  GOOD: { min: 7.0, max: 8.4, label: "Good", color: "#2196F3" },
  AVERAGE: { min: 5.0, max: 6.9, label: "Average", color: "#FF9800" },
  NEEDS_WORK: { min: 0, max: 4.9, label: "Needs Work", color: "#F44336" }
};

const ACHIEVEMENT_LEVELS = {
  BRONZE: { value: 1, label: "Bronze", color: "#CD7F32" },
  SILVER: { value: 2, label: "Silver", color: "#C0C0C0" },
  GOLD: { value: 3, label: "Gold", color: "#FFD700" },
  PLATINUM: { value: 4, label: "Platinum", color: "#E5E4E2" }
};

const SCORE_VALIDATION_RULES = {
  MIN_SCORE: 0,
  MAX_SCORE: 10,
  DECIMAL_PLACES: 1,
  REQUIRED_CATEGORIES: ["technique", "fitness"],
  MIN_CATEGORIES_FOR_OVERALL: 2
};

const IMPROVEMENT_THRESHOLDS = {
  RAPID: 2.0,        // 2+ points improvement
  SIGNIFICANT: 1.0,   // 1+ points improvement
  MODERATE: 0.5,      // 0.5+ points improvement
  MINIMAL: 0.1,       // 0.1+ points improvement
  DECLINING: -0.1     // Any negative change
};

const CONSISTENCY_LEVELS = {
  EXCELLENT: { min: 8.0, label: "Excellent Consistency" },
  GOOD: { min: 6.0, label: "Good Consistency" },
  AVERAGE: { min: 4.0, label: "Average Consistency" },
  POOR: { min: 0, label: "Poor Consistency" }
};

const AUTO_ACHIEVEMENT_RULES = {
  EXCELLENCE_BADGE: {
    condition: (scores) => scores.overall >= 8.5,
    flag: "excellence_badge",
    name: "Excellence Badge",
    description: "Achieved overall score of 8.5 or higher"
  },
  RAPID_IMPROVEMENT: {
    condition: (scores, history) => {
      if (!history || history.length < 2) return false;
      const current = scores.overall;
      const previous = history[history.length - 1]?.overall || 0;
      return (current - previous) >= IMPROVEMENT_THRESHOLDS.RAPID;
    },
    flag: "rapid_improvement",
    name: "Rapid Improvement",
    description: "Improved by 2 or more points"
  },
  CONSISTENT_PERFORMER: {
    condition: (scores, history) => {
      if (!history || history.length < 3) return false;
      const recentScores = history.slice(-3).map(h => h.overall);
      const allAbove7 = recentScores.every(score => score >= 7.0);
      return allAbove7 && scores.overall >= 7.0;
    },
    flag: "consistent_performer",
    name: "Consistent Performer",
    description: "Maintained high scores for 3+ months"
  }
};

module.exports = {
  SPORTS_SCORING_FLAGS,
  SCORE_RANGES,
  ACHIEVEMENT_LEVELS,
  SCORE_VALIDATION_RULES,
  IMPROVEMENT_THRESHOLDS,
  CONSISTENCY_LEVELS,
  AUTO_ACHIEVEMENT_RULES
};
