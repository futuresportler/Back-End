const userRepository = require("./repositories/userRepository");
const { generateTokens } = require("../../config/auth");
const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { warn } = require("../../config/logging");
const { generateOTP, storeOTP, verifyOTP } = require("../../config/otp");
const { sendOTPEmail } = require("../../config/emailService");
const firebase = require("../../config/firebase");
const { scoreService } = require("../../services/score");
const achievementService = require("../../services/score/achievementService");
const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../../database");

const getUserById = async (userId) => {
  return await userRepository.findById(userId);
};

const getUserByEmail = async (email) => {
  return await userRepository.findByEmail(email);
};

const getUserByMobile = async (mobileNumber) => {
  return await userRepository.findByMobile(mobileNumber);
};

const signUp = async (userData) => {
  const { email, password, ...otherData } = userData;

  // Check if user exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    error.message = "User already exists";
    throw error;
  }
  // Hash password
  const hashedPassword = await hashPassword(password);
  // Create user
  const newUser = await userRepository.createUser({
    ...otherData,
    email,
    password: hashedPassword,
    role: userData.role || "user"
  });

  setTimeout(async () => {
    const user = await userRepository.findById(newUser.userId);
    if (user && !user.isVerified) {
      await userRepository.deleteUser(user.userId);
      warn(`User with Email ${user.email} deleted due to non-verification.`);
    }
  }, 10 * 60 * 1000); // 2 minute in milliseconds

  // Generate tokens
  const tokens = generateTokens(newUser);
  return { tokens };
};

const signIn = async (data) => {
  const { email, password: passwordRaw } = data;
  // Find user
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    error.message = "Invalid Credentials";
    throw error;
  }
  // Compare passwords
  const isMatch = await comparePassword(passwordRaw, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  // Generate tokens
  const tokens = generateTokens(user);

  return tokens;
};

const refreshToken = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokens(user);
  return accessToken;
};

const updateUser = async (userId, updateData) => {
  return await userRepository.updateUser(userId, updateData);
};

const deleteUser = async (userId) => {
  return await userRepository.deleteUser(userId);
};

const requestOTP = async (email) => {
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
};

const verifyOTPCode = async (email, otp) => {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await updateUser(user.userId, { isVerified: true });
  return { message: "OTP verified successfully!" };
};

const forgotPassword = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
};

const forgotPasswordOTPVerify = async (email, otp) => {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  const user = await getUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await updateUser(user.userId, { isVerified: true });
  const tokens = generateTokens(user);
  return { tokens };
};

const resetPassword = async (userId, password) => {
  const hashedPassword = await hashPassword(password);
  await updateUser(userId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

const handleOAuth = async (idToken) => {
  try {
    const decodedToken = await firebase.verifyIdToken(idToken);

    const { email, name, picture, uid } = decodedToken;

    const displayName = name || email.split("@")[0];
    const nameParts = displayName.split(" ");
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    let user = await userRepository.findByEmail(email);

    if (user) {
      if (!user.isOAuth) {
        user = await userRepository.updateUser(user.userId, {
          isOAuth: true,
          firebaseUID: uid,
        });
      }
    } else {
      user = await userRepository.createUser({
        email,
        first_name,
        last_name,
        profile_picture: picture || null,
        isOAuth: true,
        isVerified: true,
        firebaseUID: uid,
        role: "user",
      });
    }

    const tokens = generateTokens(user);
    return { user, tokens };
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    throw new Error("Invalid or expired authentication token");
  }
};

const createUser = async (userData) => {
  return await userRepository.createUser(userData);
};

// User Score Management
const getUserScores = async (userId, options = {}) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const result = {
    userId,
    currentScores: user.currentScores || {},
    achievementFlags: user.achievementFlags || []
  };

  if (options.includeHistory) {
    result.scoreHistory = user.scoreHistory || {};
  }

  return result;
};

const updateUserScore = async (userId, scoreData, assessorId, assessorType = "user") => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Validate score data
  if (scoreData.sportScores) {
    for (const [sport, scores] of Object.entries(scoreData.sportScores)) {
      // Validate sport scores
      if (scores.overall !== undefined && (scores.overall < 0 || scores.overall > 10)) {
        throw new Error(`Overall score for ${sport} must be between 0 and 10`);
      }
    }
  }

  // Prepare score data with metadata
  const enrichedScoreData = {
    ...scoreData,
    scoreMetrics: {
      ...scoreData.scoreMetrics,
      assessmentDate: new Date().toISOString(),
      assessedBy: assessorId,
      assessorType: assessorType,
      methodology: scoreData.methodology || "practical_assessment",
    },
  };

  // Get current month
  const currentMonth = await getCurrentMonth();

  // Update user scores
  const currentScores = {
    ...user.currentScores,
    ...enrichedScoreData.currentScores
  };

  // Update score history
  const scoreHistory = user.scoreHistory || {};
  const monthKey = `${currentMonth.year}-${currentMonth.monthNumber}`;
  
  if (!scoreHistory[monthKey]) {
    scoreHistory[monthKey] = [];
  }
  
  scoreHistory[monthKey].push({
    timestamp: new Date().toISOString(),
    scores: enrichedScoreData.currentScores || enrichedScoreData.sportScores,
    assessorId,
    assessorType
  });

  // Update user with new scores
  await userRepository.updateUser(userId, {
    currentScores,
    scoreHistory
  });

  // Process auto achievements
  const achievements = await processAutoAchievements(userId, currentScores);

  return {
    success: true,
    message: "User scores updated successfully",
    scoreData: currentScores,
    achievements
  };
};

const getUserScoreHistory = async (userId, months = 6) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const scoreHistory = user.scoreHistory || {};
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  // Filter history entries by date
  const filteredHistory = {};
  for (const [monthKey, entries] of Object.entries(scoreHistory)) {
    const [year, month] = monthKey.split('-').map(Number);
    const entryDate = new Date(year, month - 1, 1); // Month is 0-indexed in Date constructor
    
    if (entryDate >= cutoffDate) {
      filteredHistory[monthKey] = entries;
    }
  }

  return filteredHistory;
};

const getUserScoreAnalytics = async (userId, months = 6) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const scoreHistory = await getUserScoreHistory(userId, months);
  
  // Flatten history entries for analysis
  const flatHistory = [];
  for (const [monthKey, entries] of Object.entries(scoreHistory)) {
    entries.forEach(entry => {
      flatHistory.push({
        monthKey,
        ...entry
      });
    });
  }

  // Sort by timestamp (newest first)
  flatHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Calculate trends
  const trends = calculateScoreTrends(flatHistory);

  // Generate insights
  const insights = generateUserInsights(flatHistory, trends);

  return {
    history: flatHistory,
    trends,
    insights,
    currentScores: user.currentScores || {}
  };
};

const awardUserAchievement = async (userId, achievement) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const achievementData = {
    id: uuidv4(),
    type: achievement.type,
    name: achievement.name,
    description: achievement.description,
    earnedDate: new Date().toISOString(),
    sport: achievement.sport || "general",
    level: achievement.level || "bronze",
  };

  // Update user achievement flags
  const updatedFlags = [
    ...(user.achievementFlags || []),
    achievement.type
  ];

  await userRepository.updateUser(userId, { achievementFlags: updatedFlags });

  return achievementData;
};

// User Progress Tracking
const getUserProgressTracking = async (userId, timeframe = 6) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get score analytics
  const scoreAnalytics = await getUserScoreAnalytics(userId, timeframe);
  
  // Get progress tracking data
  const progressData = await getProgressTrackingData(userId);

  return {
    scores: scoreAnalytics,
    progressTracking: progressData,
    integratedInsights: generateIntegratedInsights(scoreAnalytics, progressData),
    recommendations: generateProgressBasedRecommendations(scoreAnalytics, progressData)
  };
};

const updateUserProgressTracking = async (userId, progressData, assessorId, assessorType = "user") => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get current date info for tracking
  const now = new Date();
  const year = now.getFullYear().toString();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const sport = progressData.sport || "general";

  // Initialize progress tracking structure if needed
  const currentProgress = user.progressTracking || {};
  
  if (!currentProgress[year]) {
    currentProgress[year] = {};
  }
  
  if (!currentProgress[year][quarter]) {
    currentProgress[year][quarter] = {};
  }
  
  if (!currentProgress[year][quarter][sport]) {
    currentProgress[year][quarter][sport] = {};
  }

  // Update progress data with metadata
  const enrichedProgressData = {
    ...progressData,
    lastUpdated: now.toISOString(),
    updatedBy: {
      id: assessorId,
      type: assessorType
    }
  };

  // Merge with existing data
  currentProgress[year][quarter][sport] = {
    ...currentProgress[year][quarter][sport],
    ...enrichedProgressData
  };

  // Update user with new progress tracking data
  await userRepository.updateUser(userId, {
    progressTracking: currentProgress
  });

  return {
    success: true,
    message: "User progress tracking updated successfully",
    progressData: currentProgress
  };
};

const generateUserProgressReport = async (userId, year, quarter) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get score data for the quarter
  const scoreData = await getQuarterlyScoreData(userId, year, quarter);
  
  // Get progress data for the quarter
  const progressData = await getQuarterlyProgressData(userId, year, quarter);
  
  // Get achievements earned in the quarter
  const achievements = await getQuarterlyAchievements(userId, year, quarter);

  const report = {
    reportId: uuidv4(),
    userId,
    quarter: `${year}-${quarter}`,
    generatedAt: new Date().toISOString(),

    summary: {
      overallImprovement: calculateOverallImprovement(scoreData, progressData),
      goalsAchieved: countAchievedGoals(progressData),
      consistencyScore: calculateConsistencyScore(scoreData),
    },

    scoreAnalysis: {
      initialScores: scoreData.initial,
      finalScores: scoreData.final,
      improvements: scoreData.improvements,
      trends: analyzeQuarterlyTrends(scoreData.history),
    },

    progressDetails: {
      skillDevelopment: progressData.skills || {},
      personalizedGoals: progressData.personalizedGoals || {},
      challenges: progressData.challenges || [],
      breakthroughs: progressData.breakthroughs || [],
    },

    achievements: achievements,

    nextQuarterPlan: {
      focusAreas: identifyFocusAreas(scoreData, progressData),
      suggestedGoals: suggestNextGoals(progressData),
      recommendedIntensity: recommendTrainingIntensity(scoreData, progressData),
    },
  };

  // Store the report in user's data
  await storeQuarterlyReport(userId, report);

  return report;
};

const trackUserMilestones = async (userId, sport) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const currentScores = getCurrentUserScores(user, sport);
  const progressData = await getProgressTrackingData(userId);

  const milestones = {
    current: getCurrentMilestone(currentScores),
    next: getNextMilestone(currentScores),
    progressToNext: calculateMilestoneProgress(currentScores),
    estimatedAchievementDate: estimateMilestoneDate(currentScores, progressData),
    milestoneHistory: getMilestoneHistory(progressData),
  };

  return milestones;
};

// Helper functions
const getCurrentMonth = async () => {
  const now = new Date();
  const month = await sequelize.models.Month.findOne({
    where: {
      monthNumber: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  if (!month) {
    throw new Error("Current month not found in database");
  }

  return month;
};

const processAutoAchievements = async (userId, scores) => {
  const achievements = [];

  // Check for score-based achievements
  if (scores.overall >= 8.5) {
    achievements.push(
      await awardUserAchievement(userId, {
        type: "excellence_badge",
        name: "Excellence Badge",
        description: "Achieved overall score of 8.5 or higher",
        sport: scores.sport || "general",
      })
    );
  }

  // Process sport-specific achievements
  if (scores.sportScores) {
    for (const [sport, sportScore] of Object.entries(scores.sportScores)) {
      if (sportScore.overall >= 7.0) {
        achievements.push(
          await awardUserAchievement(userId, {
            type: `${sport}_performer`,
            name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Performer`,
            description: `Reached 7.0 overall score in ${sport}`,
            sport,
            level: "silver",
          })
        );
      }
    }
  }

  return achievements;
};

const calculateScoreTrends = (scoreHistory) => {
  if (scoreHistory.length < 2) return { trend: "insufficient_data" };

  const getOverallScore = (entry) => {
    if (entry.scores.overall) return entry.scores.overall;
    if (entry.scores.sportScores?.overall) return entry.scores.sportScores.overall;
    return 0;
  };

  const scores = scoreHistory.map(getOverallScore);
  const latestScore = scores[0];
  const previousScore = scores[1];

  let trend = "stable";
  const improvement = latestScore - previousScore;

  if (improvement > 0.5) trend = "improving";
  else if (improvement < -0.5) trend = "declining";

  return {
    trend,
    improvement,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
    consistency: calculateConsistency(scores),
  };
};

const calculateConsistency = (scores) => {
  if (scores.length < 3) return 0;

  const variance =
    scores.reduce((acc, score, index) => {
      if (index === 0) return 0;
      return acc + Math.abs(score - scores[index - 1]);
    }, 0) /
    (scores.length - 1);

  return Math.max(0, 10 - variance); // Higher consistency = lower variance
};

const generateUserInsights = (scoreHistory, trends) => {
  const insights = [];

  if (trends.trend === "improving") {
    insights.push("User shows consistent improvement over time");
  } else if (trends.trend === "declining") {
    insights.push("User needs additional support and attention");
  }

  if (trends.consistency > 8) {
    insights.push("User demonstrates excellent consistency");
  } else if (trends.consistency < 5) {
    insights.push("User performance varies significantly - focus on consistency");
  }

  return insights;
};

const getProgressTrackingData = async (userId) => {
  const user = await userRepository.findById(userId);
  return user?.progressTracking || {};
};

const generateIntegratedInsights = (scoreAnalytics, progressData) => {
  const insights = [];

  // Correlate score trends with progress tracking
  if (
    scoreAnalytics.trends.trend === "improving" &&
    progressData &&
    Object.keys(progressData).length > 0
  ) {
    insights.push("Score improvements align well with documented progress tracking");
  }

  // Check for goal achievement
  const hasProgressGoals = hasAchievedGoals(progressData);
  if (hasProgressGoals && scoreAnalytics.trends.improvement > 1.0) {
    insights.push("Strong correlation between goal achievement and score improvement");
  }

  return insights;
};

const generateProgressBasedRecommendations = (scoreAnalytics, progressData) => {
  const recommendations = [];

  // Score-based recommendations
  if (scoreAnalytics.trends.trend === "declining") {
    recommendations.push({
      type: "urgent",
      category: "performance",
      suggestion: "Review current training approach - declining score trend detected",
    });
  }

  // Progress tracking recommendations
  if (!progressData || Object.keys(progressData).length === 0) {
    recommendations.push({
      type: "improvement",
      category: "tracking",
      suggestion: "Implement detailed progress tracking for better insights",
    });
  }

  return recommendations;
};

const hasAchievedGoals = (progressData) => {
  if (!progressData) return false;

  for (const yearData of Object.values(progressData)) {
    for (const quarterData of Object.values(yearData)) {
      for (const sportData of Object.values(quarterData)) {
        if (sportData.personalizedGoals?.achieved?.length > 0) {
          return true;
        }
      }
    }
  }

  return false;
};

const getQuarterlyScoreData = async (userId, year, quarter) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const scoreHistory = user.scoreHistory || {};
  const quarterMonths = getQuarterMonths(year, quarter);
  
  const historyEntries = [];
  
  // Collect all entries from the quarter months
  quarterMonths.forEach(monthKey => {
    if (scoreHistory[monthKey]) {
      historyEntries.push(...scoreHistory[monthKey]);
    }
  });

  if (historyEntries.length === 0) {
    return { initial: {}, final: {}, improvements: {}, history: [] };
  }

  // Sort by timestamp
  historyEntries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const initial = historyEntries[0].scores;
  const final = historyEntries[historyEntries.length - 1].scores;

  return {
    initial,
    final,
    improvements: calculateScoreImprovements(initial, final),
    history: historyEntries,
  };
};

const getQuarterMonths = (year, quarter) => {
  const quarterNum = parseInt(quarter.replace('Q', ''));
  const startMonth = (quarterNum - 1) * 3 + 1;
  
  return [
    `${year}-${startMonth}`,
    `${year}-${startMonth + 1}`,
    `${year}-${startMonth + 2}`
  ];
};

const getQuarterlyProgressData = async (userId, year, quarter) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const progressData = user.progressTracking || {};
  return progressData[year]?.[quarter] || {};
};

const getQuarterlyAchievements = async (userId, year, quarter) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Since we don't have achievement timestamps in the flags array,
  // we can't filter by quarter. Return all achievements.
  return user.achievementFlags || [];
};

const calculateScoreImprovements = (initial, final) => {
  const improvements = {};

  // Handle overall score
  if (initial.overall !== undefined && final.overall !== undefined) {
    improvements.overall = final.overall - initial.overall;
  }

  // Handle sport-specific scores
  if (initial.sportScores && final.sportScores) {
    improvements.sportScores = {};
    
    for (const sport in final.sportScores) {
      if (initial.sportScores[sport]) {
        improvements.sportScores[sport] = {};
        
        if (final.sportScores[sport].overall !== undefined && 
            initial.sportScores[sport].overall !== undefined) {
          improvements.sportScores[sport].overall = 
            final.sportScores[sport].overall - initial.sportScores[sport].overall;
        }
        
        // Handle categories
        for (const category in final.sportScores[sport]) {
          if (category !== 'overall' && 
              initial.sportScores[sport][category] !== undefined) {
            improvements.sportScores[sport][category] = 
              final.sportScores[sport][category] - initial.sportScores[sport][category];
          }
        }
      }
    }
  }

  return improvements;
};

const calculateOverallImprovement = (scoreData, progressData) => {
  let improvements = [];

  // Score-based improvement
  Object.values(scoreData.improvements).forEach((improvement) => {
    if (typeof improvement === "number") {
      improvements.push(improvement);
    }
  });

  return improvements.length > 0
    ? improvements.reduce((a, b) => a + b, 0) / improvements.length
    : 0;
};

const countAchievedGoals = (progressData) => {
  let achievedCount = 0;

  Object.values(progressData).forEach((sportData) => {
    if (sportData.personalizedGoals?.achieved) {
      achievedCount += sportData.personalizedGoals.achieved.length;
    }
  });

  return achievedCount;
};

const calculateConsistencyScore = (scoreData) => {
  if (scoreData.history.length < 3) return 0;

  const scores = scoreData.history.map(
    (h) => h.scores.overall || 0
  );

  return calculateConsistency(scores);
};

const analyzeQuarterlyTrends = (scoreHistory) => {
  return calculateScoreTrends(scoreHistory);
};

const identifyFocusAreas = (scoreData, progressData) => {
  const focusAreas = [];

  // Identify areas with lowest scores
  if (scoreData.final) {
    const scoreAreas = Object.entries(scoreData.final)
      .filter(([key, value]) => {
        const score =
          typeof value === "object" ? value.score || value.overall : value;
        return score < 6.0;
      })
      .map(([key]) => key);

    focusAreas.push(...scoreAreas);
  }

  // Identify areas with ongoing challenges
  Object.values(progressData).forEach((sportData) => {
    if (sportData.challenges) {
      focusAreas.push(...sportData.challenges);
    }
  });

  return [...new Set(focusAreas)].slice(0, 5); // Return unique top 5
};

const suggestNextGoals = (progressData) => {
  const suggestions = [];

  Object.entries(progressData).forEach(([sport, sportData]) => {
    if (sportData.personalizedGoals?.inProgress) {
      suggestions.push(
        ...sportData.personalizedGoals.inProgress.map((goal) => ({
          sport,
          goal,
          priority: "continue",
        }))
      );
    }

    if (sportData.nextQuarterFocus) {
      suggestions.push(
        ...sportData.nextQuarterFocus.map((focus) => ({
          sport,
          goal: focus,
          priority: "new",
        }))
      );
    }
  });

  return suggestions.slice(0, 8); // Limit to 8 goals
};

const recommendTrainingIntensity = (scoreData, progressData) => {
  const improvements = Object.values(scoreData.improvements);
  const avgImprovement =
    improvements.length > 0
      ? improvements.reduce((a, b) => a + b, 0) / improvements.length
      : 0;

  if (avgImprovement > 1.5) {
    return "maintain"; // Current intensity is working well
  } else if (avgImprovement < 0.5) {
    return "increase"; // Need more intensive training
  } else {
    return "adjust"; // Fine-tune based on specific areas
  }
};

const storeQuarterlyReport = async (userId, report) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const quarterlyReports = user.quarterlyReports || [];
  quarterlyReports.push(report);

  await userRepository.updateUser(userId, { quarterlyReports });
  return report;
};

const getCurrentUserScores = (user, sport) => {
  if (!user.currentScores) return {};
  
  if (sport && user.currentScores.sportScores?.[sport]) {
    return user.currentScores.sportScores[sport];
  }
  
  return user.currentScores;
};

const getCurrentMilestone = (scores) => {
  const overall = scores.overall || 0;
  
  if (overall >= 9.0) return { level: "master", name: "Master Level", description: "Achieved mastery level performance" };
  if (overall >= 8.0) return { level: "advanced", name: "Advanced Level", description: "Achieved advanced level performance" };
  if (overall >= 7.0) return { level: "intermediate", name: "Intermediate Level", description: "Achieved intermediate level performance" };
  if (overall >= 5.0) return { level: "beginner", name: "Beginner Level", description: "Achieved beginner level performance" };
  
  return { level: "novice", name: "Novice Level", description: "Starting the journey" };
};

const getNextMilestone = (scores) => {
  const overall = scores.overall || 0;
  
  if (overall < 5.0) return { level: "beginner", name: "Beginner Level", threshold: 5.0 };
  if (overall < 7.0) return { level: "intermediate", name: "Intermediate Level", threshold: 7.0 };
  if (overall < 8.0) return { level: "advanced", name: "Advanced Level", threshold: 8.0 };
  if (overall < 9.0) return { level: "master", name: "Master Level", threshold: 9.0 };
  
  return { level: "legend", name: "Legend Status", threshold: 10.0 };
};

const calculateMilestoneProgress = (scores) => {
  const overall = scores.overall || 0;
  const current = getCurrentMilestone(scores);
  const next = getNextMilestone(scores);
  
  let baseValue = 0;
  switch (current.level) {
    case "novice": baseValue = 0; break;
    case "beginner": baseValue = 5.0; break;
    case "intermediate": baseValue = 7.0; break;
    case "advanced": baseValue = 8.0; break;
    case "master": baseValue = 9.0; break;
    default: baseValue = 0;
  }
  
  const range = next.threshold - baseValue;
  const progress = overall - baseValue;
  
  return {
    percentage: Math.min(100, Math.round((progress / range) * 100)),
    pointsToNext: Math.max(0, (next.threshold - overall).toFixed(1))
  };
};

const estimateMilestoneDate = (scores, progressData) => {
  // This is a simplified estimation
  const progress = calculateMilestoneProgress(scores);
  const pointsNeeded = parseFloat(progress.pointsToNext);
  
  if (pointsNeeded <= 0) return "Already achieved";
  
  // Assume average improvement of 0.5 points per month
  const monthsNeeded = Math.ceil(pointsNeeded / 0.5);
  
  const date = new Date();
  date.setMonth(date.getMonth() + monthsNeeded);
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const getMilestoneHistory = (progressData) => {
  const milestones = [];
  
  // This would require more detailed tracking in the progressData
  // For now, return an empty array
  
  return milestones;
};

// Enhanced Progress Tracking with dedicated repository







const generateCombinedInsights = (scoreAnalytics, progressAnalytics) => {
  const insights = [];

  // Correlate score trends with detailed progress
  if (scoreAnalytics.trends.trend === "improving" && progressAnalytics.averageEngagement > 7.0) {
    insights.push("Strong correlation between high engagement and score improvement");
  }

  if (progressAnalytics.averageConsistency > 8.0 && scoreAnalytics.trends.consistency > 8.0) {
    insights.push("Excellent consistency across both scores and progress tracking");
  }

  if (progressAnalytics.averageImprovement > 1.0 && scoreAnalytics.trends.improvement > 1.0) {
    insights.push("Significant improvement detected in both scoring and progress metrics");
  }

  // Analyze sport-specific trends
  progressAnalytics.sportsTracked.forEach(sport => {
    const sportTrend = progressAnalytics.trends[sport];
    if (sportTrend && sportTrend.direction === "improving" && sportTrend.engagement === "high") {
      insights.push(`${sport}: Excellent progress with high engagement`);
    } else if (sportTrend && sportTrend.direction === "declining") {
      insights.push(`${sport}: Needs attention - declining trend detected`);
    }
  });

  return insights;
};

const generateEnhancedRecommendations = (scoreAnalytics, progressAnalytics) => {
  const recommendations = [];

  // Score-based recommendations
  if (scoreAnalytics.trends.trend === "declining") {
    recommendations.push({
      type: "urgent",
      category: "performance",
      suggestion: "Review current training approach - declining score trend detected",
      priority: "high"
    });
  }

  // Engagement-based recommendations
  if (progressAnalytics.averageEngagement < 5.0) {
    recommendations.push({
      type: "engagement",
      category: "motivation",
      suggestion: "Implement engagement strategies - low participation detected",
      priority: "high"
    });
  }

  // Consistency recommendations
  if (progressAnalytics.averageConsistency < 6.0) {
    recommendations.push({
      type: "consistency",
      category: "routine",
      suggestion: "Focus on building consistent practice routines",
      priority: "medium"
    });
  }

  // Sport-specific recommendations
  progressAnalytics.sportsTracked.forEach(sport => {
    const sportTrend = progressAnalytics.trends[sport];
    if (sportTrend && sportTrend.engagement === "low") {
      recommendations.push({
        type: "sport_specific",
        category: "engagement",
        suggestion: `Increase engagement activities for ${sport}`,
        priority: "medium",
        sport
      });
    }
  });

  // Improvement rate recommendations
  if (progressAnalytics.averageImprovement < 0.5) {
    recommendations.push({
      type: "improvement",
      category: "training",
      suggestion: "Consider intensifying training or changing methodology",
      priority: "medium"
    });
  }

  return recommendations;
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByMobile,
  signUp,
  signIn,
  refreshToken,
  updateUser,
  deleteUser,
  requestOTP,
  verifyOTPCode,
  forgotPassword,
  forgotPasswordOTPVerify,
  resetPassword,
  handleOAuth,
  createUser,
  // User Score Management
  getUserScores,
  updateUserScore,
  getUserScoreHistory,
  getUserScoreAnalytics,
  awardUserAchievement,
  // User Progress Tracking (Basic)
  getUserProgressTracking,
  updateUserProgressTracking,
  generateUserProgressReport,
  trackUserMilestones,

};
