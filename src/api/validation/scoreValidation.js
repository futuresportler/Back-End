const {
  SPORTS_SCORING_FLAGS,
  SCORE_VALIDATION_RULES,
} = require("../../config/scoreConstants");

const validateScore = (req, res, next) => {
  try {
    const { scoreData, students } = req.body;

    // Handle bulk updates
    if (students && Array.isArray(students)) {
      for (const student of students) {
        if (!student.scoreData) {
          return res.status(400).json({
            success: false,
            message: `Missing scoreData for student ${student.studentId}`,
          });
        }
        validateScoreDataStructure(student.scoreData);
      }
    }

    // Handle single score update
    if (scoreData) {
      validateScoreDataStructure(scoreData);
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Score validation failed",
      error: error.message,
    });
  }
};

const validateScoreDataStructure = (scoreData) => {
  // Validate sport scores if provided
  if (scoreData.sportScores) {
    for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
      // Check if sport is supported
      if (!SPORTS_SCORING_FLAGS[sport]) {
        throw new Error(`Unsupported sport: ${sport}`);
      }

      // Validate score structure
      validateSportScoreStructure(sport, scores);
    }
  }

  // Validate current scores if provided
  if (scoreData.currentScores) {
    validateCurrentScoreStructure(scoreData.currentScores);
  }

  // Validate score flags if provided
  if (scoreData.scoreFlags && Array.isArray(scoreData.scoreFlags)) {
    validateScoreFlags(scoreData.scoreFlags);
  }

  // Validate achievement flags if provided
  if (scoreData.achievementFlags && Array.isArray(scoreData.achievementFlags)) {
    validateAchievementFlags(scoreData.achievementFlags);
  }
};

const validateSportScoreStructure = (sport, scores) => {
  const sportConfig = SPORTS_SCORING_FLAGS[sport];

  // Validate each category score
  for (const [category, scoreObj] of Object.entries(scores)) {
    if (category === "overall") {
      // Overall score can be a number or score object
      if (typeof scoreObj === "number") {
        validateScoreValue(scoreObj, `${sport}.overall`);
      } else if (typeof scoreObj === "object" && scoreObj.score !== undefined) {
        validateScoreValue(scoreObj.score, `${sport}.overall`);
      }
      continue;
    }

    // Check if category is valid for this sport
    if (!sportConfig.categories.includes(category)) {
      throw new Error(
        `Invalid category '${category}' for sport '${sport}'. Valid categories: ${sportConfig.categories.join(
          ", "
        )}`
      );
    }

    // Validate score object structure
    if (typeof scoreObj === "object") {
      if (scoreObj.score !== undefined) {
        validateScoreValue(scoreObj.score, `${sport}.${category}`);
      }

      // Validate flag if provided
      if (scoreObj.flag) {
        const validFlags = [
          "poor",
          "average",
          "good",
          "excellent",
          "outstanding",
        ];
        if (!validFlags.includes(scoreObj.flag)) {
          throw new Error(
            `Invalid flag '${
              scoreObj.flag
            }' for ${sport}.${category}. Valid flags: ${validFlags.join(", ")}`
          );
        }
      }
    } else if (typeof scoreObj === "number") {
      validateScoreValue(scoreObj, `${sport}.${category}`);
    }
  }
};

const validateCurrentScoreStructure = (currentScores) => {
  for (const [key, value] of Object.entries(currentScores)) {
    if (typeof value === "number") {
      validateScoreValue(value, key);
    } else if (typeof value === "object" && value !== null) {
      // Handle nested score objects
      if (value.overall !== undefined) {
        validateScoreValue(value.overall, `${key}.overall`);
      }
      if (value.breakdown && typeof value.breakdown === "object") {
        for (const [subKey, subValue] of Object.entries(value.breakdown)) {
          if (typeof subValue === "number") {
            validateScoreValue(subValue, `${key}.breakdown.${subKey}`);
          }
        }
      }
    }
  }
};

const validateScoreValue = (score, fieldName) => {
  if (typeof score !== "number") {
    throw new Error(`Score for '${fieldName}' must be a number`);
  }

  if (
    score < SCORE_VALIDATION_RULES.MIN_SCORE ||
    score > SCORE_VALIDATION_RULES.MAX_SCORE
  ) {
    throw new Error(
      `Score for '${fieldName}' must be between ${SCORE_VALIDATION_RULES.MIN_SCORE} and ${SCORE_VALIDATION_RULES.MAX_SCORE}`
    );
  }

  // Check decimal places
  const decimalPlaces = (score.toString().split(".")[1] || "").length;
  if (decimalPlaces > SCORE_VALIDATION_RULES.DECIMAL_PLACES) {
    throw new Error(
      `Score for '${fieldName}' can have maximum ${SCORE_VALIDATION_RULES.DECIMAL_PLACES} decimal place(s)`
    );
  }
};

const validateScoreFlags = (scoreFlags) => {
  for (const flag of scoreFlags) {
    if (typeof flag !== "object") {
      throw new Error("Each score flag must be an object");
    }

    if (!flag.sport || !flag.flag) {
      throw new Error("Score flag must include 'sport' and 'flag' properties");
    }

    // Validate sport
    if (!SPORTS_SCORING_FLAGS[flag.sport]) {
      throw new Error(`Invalid sport '${flag.sport}' in score flag`);
    }

    // Validate flag for sport
    const validFlags = SPORTS_SCORING_FLAGS[flag.sport].flags;
    if (!validFlags.includes(flag.flag)) {
      throw new Error(
        `Invalid flag '${flag.flag}' for sport '${
          flag.sport
        }'. Valid flags: ${validFlags.join(", ")}`
      );
    }
  }
};

const validateAchievementFlags = (achievementFlags) => {
  // Get all valid flags from all sports
  const allValidFlags = Object.values(SPORTS_SCORING_FLAGS).flatMap(
    (sport) => sport.flags
  );

  for (const flag of achievementFlags) {
    if (typeof flag !== "string") {
      throw new Error("Achievement flags must be strings");
    }

    if (!allValidFlags.includes(flag)) {
      console.warn(
        `Warning: Achievement flag '${flag}' is not in predefined sports flags`
      );
    }
  }
};

const validateScorePermissions = (req, res, next) => {
  try {
    const { studentType } = req.body;
    const userRole = req.user?.role || req.supplier?.role;

    // Define permission rules
    const permissions = {
      coach: {
        canUpdate: ["coach"],
        studentTypes: ["coach"],
      },
      academy: {
        canUpdate: ["coach", "academy"],
        studentTypes: ["academy"],
      },
      academy_coach: {
        canUpdate: ["academy_coach"],
        studentTypes: ["academy"],
      },
    };

    // Check if user can update this student type
    if (
      studentType &&
      !permissions[userRole]?.studentTypes.includes(studentType)
    ) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' cannot update '${studentType}' student scores`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Permission validation failed",
      error: error.message,
    });
  }
};

module.exports = {
  validateScore,
  validateScorePermissions,
  validateScoreDataStructure,
  validateSportScoreStructure,
  validateCurrentScoreStructure,
  validateScoreValue,
};
