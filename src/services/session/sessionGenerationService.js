const { Op } = require("sequelize");
const { sequelize } = require("../../database");
const { info, error } = require("../../config/logging");
const config = require("../../common/utils/config");
const { v4: uuidv4 } = require("uuid");

// Import models
const { AcademyBatchSession, AcademyProgramSession, CoachSession, TurfSession, AcademyBatch, AcademyProgram, CoachBatch, TurfGround} = require("../../database/index");

/**
 * Generate a unique session ID
 * @param {string} prefix - Prefix for the session ID (e.g., 'acad', 'coach', 'turf')
 * @param {string} entityId - ID of the entity (batch, program, ground)
 * @param {string} date - Date of the session in YYYY-MM-DD format
 * @param {string} time - Start time of the session
 * @returns {string} - Unique session ID
 */
const generateSessionId = (prefix, entityId, date, time) => {
  const shortId = entityId.substring(0, 8);
  const dateStr = date.replace(/-/g, "");
  const timeStr = time.replace(":", "");
  return `${prefix}_${shortId}_${dateStr}_${timeStr}_${uuidv4().substring(
    0,
    4
  )}`;
};

/**
 * Convert day name to day number (0 = Sunday, 1 = Monday, etc.)
 * @param {string} day - Day name (e.g., 'Mon', 'Tue')
 * @returns {number} - Day number
 */
const getDayNumber = (day) => {
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return days[day];
};

/**
 * Get all dates for a specific day in a month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} dayOfWeek - Day of the week (0-6)
 * @returns {Array} - Array of dates
 */
const getDatesForDayInMonth = (year, month, dayOfWeek) => {
  const dates = [];
  const date = new Date(year, month, 1);

  // Move to the first occurrence of the specified day
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }

  // Get all occurrences of the day in the month
  while (date.getMonth() === month) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }

  return dates;
};

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Check if a date is in the past
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is in the past
 */
const isDateInPast = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date < today;
};

/**
 * Generate academy batch sessions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 */
const generateAcademyBatchSessions = async (year, month) => {
  try {
    // Get all active batches
    const batches = await AcademyBatch.findAll({
      where: { active: true },
      include: [{ association: "academy" }],
    });

    let sessionsCreated = 0;
    const sessionPromises = [];

    // Load dynamic configuration if not already loaded
    if (config.session.rules.academy.batches.length === 0) {
      await config.loadDynamicConfig(require("../../database"));
    }

    for (const batch of batches) {
      // Get batch configuration from config or use default
      const batchConfig = config.session.rules.academy.batches.find(
        (b) => b.id === batch.id
      ) || {
        days: config.session.rules.academy.defaultDays,
        start_time: config.session.rules.academy.defaultStartTime,
        end_time: config.session.rules.academy.defaultEndTime,
      };

      // Generate sessions for each day in the batch schedule
      for (const day of batchConfig.days) {
        const dayNumber = getDayNumber(day);
        const dates = getDatesForDayInMonth(year, month, dayNumber);

        for (const date of dates) {
          const dateStr = formatDate(date);

          // Skip dates in the past
          if (isDateInPast(dateStr)) continue;

          // Check if session already exists
          const existingSession = await AcademyBatchSession.findOne({
            where: {
              batch_id: batch.id,
              date: dateStr,
              start_time: batchConfig.start_time,
            },
          });

          if (!existingSession) {
            const session_id = generateSessionId(
              "acad_batch",
              batch.id,
              dateStr,
              batchConfig.start_time
            );

            sessionPromises.push(
              AcademyBatchSession.create({
                session_id,
                batch_id: batch.id,
                academy_id: batch.academy_id,
                date: dateStr,
                start_time: batchConfig.start_time,
                end_time: batchConfig.end_time,
              })
            );

            sessionsCreated++;
          }
        }
      }
    }

    await Promise.all(sessionPromises);
    info(
      `Generated ${sessionsCreated} academy batch sessions for ${year}-${
        month + 1
      }`
    );
    return sessionsCreated;
  } catch (err) {
    error("Error generating academy batch sessions:", err);
    throw err;
  }
};

/**
 * Generate academy program sessions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 */
const generateAcademyProgramSessions = async (year, month) => {
  try {
    // Get all active programs
    const programs = await AcademyProgram.findAll({
      where: { active: true },
      include: [{ association: "academy" }],
    });

    let sessionsCreated = 0;
    const sessionPromises = [];

    // Load dynamic configuration if not already loaded
    if (config.session.rules.academy.programs.length === 0) {
      await config.loadDynamicConfig(require("../../database"));
    }

    for (const program of programs) {
      // Get program configuration from config or use default
      const programConfig = config.session.rules.academy.programs.find(
        (p) => p.id === program.id
      ) || {
        days: config.session.rules.academy.defaultDays,
        start_time: config.session.rules.academy.defaultStartTime,
        end_time: config.session.rules.academy.defaultEndTime,
      };

      // Generate sessions for each day in the program schedule
      for (const day of programConfig.days) {
        const dayNumber = getDayNumber(day);
        const dates = getDatesForDayInMonth(year, month, dayNumber);

        for (const date of dates) {
          const dateStr = formatDate(date);

          // Skip dates in the past
          if (isDateInPast(dateStr)) continue;

          // Check if session already exists
          const existingSession = await AcademyProgramSession.findOne({
            where: {
              program_id: program.id,
              date: dateStr,
              start_time: programConfig.start_time,
            },
          });

          if (!existingSession) {
            const session_id = generateSessionId(
              "acad_prog",
              program.id,
              dateStr,
              programConfig.start_time
            );

            sessionPromises.push(
              AcademyProgramSession.create({
                session_id,
                program_id: program.id,
                academy_id: program.academy_id,
                date: dateStr,
                start_time: programConfig.start_time,
                end_time: programConfig.end_time,
              })
            );

            sessionsCreated++;
          }
        }
      }
    }

    await Promise.all(sessionPromises);
    info(
      `Generated ${sessionsCreated} academy program sessions for ${year}-${
        month + 1
      }`
    );
    return sessionsCreated;
  } catch (err) {
    error("Error generating academy program sessions:", err);
    throw err;
  }
};

/**
 * Generate coach sessions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 */
const generateCoachSessions = async (year, month) => {
  try {
    // Get all active coach batches
    const batches = await CoachBatch.findAll({
      where: { active: true },
      include: [{ association: "coach" }],
    });

    let sessionsCreated = 0;
    const sessionPromises = [];

    // Load dynamic configuration if not already loaded
    if (config.session.rules.coach.batches.length === 0) {
      await config.loadDynamicConfig(require("../../database"));
    }

    for (const batch of batches) {
      // Get batch configuration from config or use default
      const batchConfig = config.session.rules.coach.batches.find(
        (b) => b.id === batch.id
      ) || {
        days: config.session.rules.coach.defaultDays,
        start_time: config.session.rules.coach.defaultStartTime,
        end_time: config.session.rules.coach.defaultEndTime,
      };

      // Generate sessions for each day in the batch schedule
      for (const day of batchConfig.days) {
        const dayNumber = getDayNumber(day);
        const dates = getDatesForDayInMonth(year, month, dayNumber);

        for (const date of dates) {
          const dateStr = formatDate(date);

          // Skip dates in the past
          if (isDateInPast(dateStr)) continue;

          // Check if session already exists
          const existingSession = await CoachSession.findOne({
            where: {
              batch_id: batch.id,
              date: dateStr,
              start_time: batchConfig.start_time,
            },
          });

          if (!existingSession) {
            const session_id = generateSessionId(
              "coach",
              batch.id,
              dateStr,
              batchConfig.start_time
            );

            sessionPromises.push(
              CoachSession.create({
                session_id,
                batch_id: batch.id,
                coach_id: batch.coach_id,
                date: dateStr,
                start_time: batchConfig.start_time,
                end_time: batchConfig.end_time,
              })
            );

            sessionsCreated++;
          }
        }
      }
    }

    await Promise.all(sessionPromises);
    info(
      `Generated ${sessionsCreated} coach sessions for ${year}-${month + 1}`
    );
    return sessionsCreated;
  } catch (err) {
    error("Error generating coach sessions:", err);
    throw err;
  }
};

/**
 * Generate turf sessions for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 */
const generateTurfSessions = async (year, month) => {
  try {
    // Get all active grounds
    const grounds = await TurfGround.findAll({
      where: { active: true },
      include: [{ association: "turf" }],
    });

    let sessionsCreated = 0;
    const sessionPromises = [];

    // Load dynamic configuration if not already loaded
    if (config.session.rules.turf.grounds.length === 0) {
      await config.loadDynamicConfig(require("../../database"));
    }

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (const ground of grounds) {
      // Get ground configuration from config or use default
      const groundConfig = config.session.rules.turf.grounds.find(
        (g) => g.id === ground.id
      ) || {
        slots: config.session.rules.turf.defaultSlots,
      };

      // Generate sessions for each day in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDate(date);

        // Skip dates in the past
        if (isDateInPast(dateStr)) continue;

        // Generate sessions for each slot
        for (const slot of groundConfig.slots) {
          const [start_time, end_time] = slot.split("-");

          // Check if session already exists
          const existingSession = await TurfSession.findOne({
            where: {
              ground_id: ground.id,
              date: dateStr,
              start_time,
            },
          });

          if (!existingSession) {
            const session_id = generateSessionId(
              "turf",
              ground.id,
              dateStr,
              start_time
            );

            sessionPromises.push(
              TurfSession.create({
                session_id,
                ground_id: ground.id,
                turf_id: ground.turf_id,
                date: dateStr,
                start_time,
                end_time,
              })
            );

            sessionsCreated++;
          }
        }
      }
    }

    await Promise.all(sessionPromises);
    info(`Generated ${sessionsCreated} turf sessions for ${year}-${month + 1}`);
    return sessionsCreated;
  } catch (err) {
    error("Error generating turf sessions:", err);
    throw err;
  }
};

/**
 * Check if it's the last week of the month
 * @returns {boolean} - True if it's the last week of the month
 */
const isLastWeekOfMonth = () => {
  const today = new Date();
  const lastDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const currentDay = today.getDate();

  // Consider the last 7 days of the month as the last week
  return currentDay > lastDayOfMonth - 7;
};

/**
 * Generate sessions for the current month and optionally the next month
 */
const generateSessions = async () => {
  try {
    // Load dynamic configuration
    await config.loadDynamicConfig(require("../../database"));

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Generate sessions for the current month
    const academyBatchSessions = await generateAcademyBatchSessions(
      currentYear,
      currentMonth
    );
    const academyProgramSessions = await generateAcademyProgramSessions(
      currentYear,
      currentMonth
    );
    const coachSessions = await generateCoachSessions(
      currentYear,
      currentMonth
    );
    const turfSessions = await generateTurfSessions(currentYear, currentMonth);

    let nextMonthSessions = 0;

    // If it's the last week of the month, generate sessions for the next month
    if (isLastWeekOfMonth()) {
      const nextMonth = (currentMonth + 1) % 12;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      nextMonthSessions += await generateAcademyBatchSessions(
        nextYear,
        nextMonth
      );
      nextMonthSessions += await generateAcademyProgramSessions(
        nextYear,
        nextMonth
      );
      nextMonthSessions += await generateCoachSessions(nextYear, nextMonth);
      nextMonthSessions += await generateTurfSessions(nextYear, nextMonth);
    }

    return {
      currentMonth: {
        academyBatchSessions,
        academyProgramSessions,
        coachSessions,
        turfSessions,
        total:
          academyBatchSessions +
          academyProgramSessions +
          coachSessions +
          turfSessions,
      },
      nextMonth: nextMonthSessions,
    };
  } catch (err) {
    error("Error generating sessions:", err);
    throw err;
  }
};

module.exports = {
  generateSessions,
  generateAcademyBatchSessions,
  generateAcademyProgramSessions,
  generateCoachSessions,
  generateTurfSessions,
};
