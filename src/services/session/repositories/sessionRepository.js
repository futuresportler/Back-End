const { Op } = require("sequelize");
const { sequelize } = require("../../../database");
const { info, error } = require("../../../config/logging");

// Import session models
const {
  AcademyBatchSession,
  AcademyProgramSession,
  CoachSession,
  TurfSession,
  User,
  CoachProfile,
  CoachBatch,
  AcademyProfile,
  AcademyBatch,
  AcademyProgram,
  TurfProfile,
  TurfGround

} = require("../../../database/index");

class SessionRepository {
  constructor() {
    this.AcademyBatchSession = AcademyBatchSession;
    this.AcademyProgramSession = AcademyProgramSession;
    this.CoachSession = CoachSession;
    this.TurfSession = TurfSession;
  }

  // General session methods
  async findSessionsByUserId(userId) {
    try {
      // Get all session types for the user
      const [academyBatchSessions, academyProgramSessions, coachSessions, turfSessions] = await Promise.all([
        this.AcademyBatchSession.findAll({
          where: { user_id: userId },
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),
        this.AcademyProgramSession.findAll({
          where: { user_id: userId },
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),
        this.CoachSession.findAll({
          where: { user_id: userId },
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),
        this.TurfSession.findAll({
          where: { user_id: userId },
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        })
      ]);

      return {
        academyBatchSessions,
        academyProgramSessions,
        coachSessions,
        turfSessions
      };
    } catch (err) {
      error('Error finding sessions by user ID:', err);
      throw err;
    }
  }

  // Coach booking methods
// Remove all other findCoachBookingsByUserId methods and keep only this one:
async findCoachBookingsByUserId(userId) {
  try {
    return await CoachSession.findAll({
      where: { 
        user_id: userId 
      },
      include: [
        {
          model: CoachBatch,
          as: 'batch',
          attributes: ['batchId', 'batchName', 'description', 'curriculum'], // Use 'batchId' not 'id'
          required: false,
          include: [
            {
              model: CoachProfile,
              as: 'coach',
              attributes: ['coachId', 'name', 'sportsCoached', 'experienceYears', 'sportsCoached', 'city'], // Use 'coachId' not 'id'
              required: false
            }
          ]
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  } catch (err) {
    console.error('Detailed error in findCoachBookingsByUserId:', err.message);
    error('Error finding coach bookings by user ID:', err);
    return [];
  }
}
  async findUserCoachSessions(userId, coachId) {
    try {
      return await this.CoachSession.findAll({
        where: { 
          user_id: userId,
          coach_id: coachId
        },
        include: [
          {
            model: CoachBatch,
            as: 'batch',
            attributes: ['id', 'name', 'description', 'sport'],
            include: [
              {
                model: CoachProfile,
                as: 'coach',
                attributes: ['id', 'name', 'sport', 'experience', 'specialization', 'location']
              }
            ]
          }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
      });
    } catch (err) {
      error('Error finding user coach sessions:', err);
      return [];
    }
  }
  // Coach booking methods

  // Academy booking methods - Academy Batch Sessions

  async findUserAcademyBatchSessions(userId, batchId) {
    try {
      return await this.AcademyBatchSession.findAll({
        where: { 
          user_id: userId,
          batch_id: batchId
        },
        include: [
          {
            model: AcademyBatch,
            as: 'batch',
            attributes: ['id', 'name', 'description', 'sport'],
            include: [
              {
                model: AcademyProfile,
                as: 'academy',
                attributes: ['id', 'name', 'sport', 'location', 'description']
              }
            ]
          }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
      });
    } catch (err) {
      error('Error finding user academy batch sessions:', err);
      return [];
    }
  }
  // Academy booking methods - Academy Program Sessions

  async findUserAcademyProgramSessions(userId, programId) {
    try {
      return await this.AcademyProgramSession.findAll({
        where: { 
          user_id: userId,
          program_id: programId
        },
        include: [
          {
            model: AcademyProgram,
            as: 'program',
            attributes: ['id', 'name', 'description', 'sport'],
            include: [
              {
                model: AcademyProfile,
                as: 'academy',
                attributes: ['id', 'name', 'sport', 'location', 'description']
              }
            ]
          }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
      });
    } catch (err) {
      error('Error finding user academy program sessions:', err);
      return [];
    }
  }

  // Combined academy bookings method
  async findAcademyBookingsByUserId(userId) {
    try {
      const [batchSessions, programSessions] = await Promise.all([
        this.findAcademyBatchBookingsByUserId(userId),
        this.findAcademyProgramBookingsByUserId(userId)
      ]);

      // Combine and sort by date
      const allSessions = [...batchSessions, ...programSessions];
      allSessions.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateB - dateA;
      });

      return allSessions;
    } catch (err) {
      error('Error finding academy bookings by user ID:', err);
      return [];
    }
  }

  async findUserAcademySessions(userId, academyId) {
    try {
      const [batchSessions, programSessions] = await Promise.all([
        this.AcademyBatchSession.findAll({
          where: { 
            user_id: userId,
            academy_id: academyId
          },
          include: [
            {
              model: AcademyBatch,
              as: 'batch',
              attributes: ['id', 'name', 'description', 'sport']
            }
          ]
        }),
        this.AcademyProgramSession.findAll({
          where: { 
            user_id: userId,
            academy_id: academyId
          },
          include: [
            {
              model: AcademyProgram,
              as: 'program',
              attributes: ['id', 'name', 'description', 'sport']
            }
          ]
        })
      ]);

      // Combine and sort by date
      const allSessions = [...batchSessions, ...programSessions];
      allSessions.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateB - dateA;
      });

      return allSessions;
    } catch (err) {
      error('Error finding user academy sessions:', err);
      return [];
    }
  }

  // Turf booking methods

  async findUserTurfSessions(userId, turfId) {
    try {
      return await this.TurfSession.findAll({
        where: { 
          user_id: userId,
          turf_id: turfId
        },
        include: [
          {
            model: TurfGround,
            as: 'ground',
            attributes: ['id', 'name', 'type', 'size', 'sport'],
            include: [
              {
                model: TurfProfile,
                as: 'turf',
                attributes: ['id', 'name', 'location', 'description']
              }
            ]
          }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
      });
    } catch (err) {
      error('Error finding user turf sessions:', err);
      return [];
    }
  }

  async findTurfBookingsByTurfId(turfId) {
    try {
      return await this.TurfSession.findAll({
        where: { turf_id: turfId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: TurfGround,
            as: 'ground',
            attributes: ['id', 'name', 'type', 'size']
          }
        ],
        order: [['date', 'DESC'], ['start_time', 'DESC']]
      });
    } catch (err) {
      error('Error finding turf bookings by turf ID:', err);
      return [];
    }
  }

  // Combined queries for better performance
  async findAllUserBookings(userId) {
    try {
      const [coachBookings, academyBookings, turfBookings] = await Promise.all([
        this.findCoachBookingsByUserId(userId),
        this.findAcademyBookingsByUserId(userId),
        this.findTurfBookingsByUserId(userId)
      ]);

      return {
        coachBookings,
        academyBookings,
        turfBookings
      };
    } catch (err) {
      error('Error finding all user bookings:', err);
      return {
        coachBookings: [],
        academyBookings: [],
        turfBookings: []
      };
    }
  }

  // Date-based queries
  async findUpcomingUserBookings(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const [coachBookings, academyBatchBookings, academyProgramBookings, turfBookings] = await Promise.all([
        this.CoachSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.gte]: todayStr },
            is_cancelled: false,
            is_completed: false
          },
          include: [
            {
              model: CoachBatch,
              as: 'batch',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: CoachProfile,
                  as: 'coach',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'ASC'], ['start_time', 'ASC']]
        }),

        this.AcademyBatchSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.gte]: todayStr },
            is_cancelled: false,
            is_completed: false
          },
          include: [
            {
              model: AcademyBatch,
              as: 'batch',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: AcademyProfile,
                  as: 'academy',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'ASC'], ['start_time', 'ASC']]
        }),

        this.AcademyProgramSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.gte]: todayStr },
            is_cancelled: false,
            is_completed: false
          },
          include: [
            {
              model: AcademyProgram,
              as: 'program',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: AcademyProfile,
                  as: 'academy',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'ASC'], ['start_time', 'ASC']]
        }),

        this.TurfSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.gte]: todayStr },
            is_cancelled: false,
            is_completed: false
          },
          include: [
            {
              model: TurfGround,
              as: 'ground',
              attributes: ['id', 'name', 'type', 'size'],
              include: [
                {
                  model: TurfProfile,
                  as: 'turf',
                  attributes: ['id', 'name', 'location']
                }
              ]
            }
          ],
          order: [['date', 'ASC'], ['start_time', 'ASC']]
        })
      ]);

      // Combine academy sessions
      const academyBookings = [...academyBatchBookings, ...academyProgramBookings];

      return {
        coachBookings,
        academyBookings,
        turfBookings
      };
    } catch (err) {
      error('Error finding upcoming user bookings:', err);
      return {
        coachBookings: [],
        academyBookings: [],
        turfBookings: []
      };
    }
  }

  async findPastUserBookings(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const [coachBookings, academyBatchBookings, academyProgramBookings, turfBookings] = await Promise.all([
        this.CoachSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.lt]: todayStr }
          },
          include: [
            {
              model: CoachBatch,
              as: 'batch',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: CoachProfile,
                  as: 'coach',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),

        this.AcademyBatchSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.lt]: todayStr }
          },
          include: [
            {
              model: AcademyBatch,
              as: 'batch',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: AcademyProfile,
                  as: 'academy',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),

        this.AcademyProgramSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.lt]: todayStr }
          },
          include: [
            {
              model: AcademyProgram,
              as: 'program',
              attributes: ['id', 'name', 'description'],
              include: [
                {
                  model: AcademyProfile,
                  as: 'academy',
                  attributes: ['id', 'name', 'sport', 'location']
                }
              ]
            }
          ],
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        }),

        this.TurfSession.findAll({
          where: { 
            user_id: userId,
            date: { [Op.lt]: todayStr }
          },
          include: [
            {
              model: TurfGround,
              as: 'ground',
              attributes: ['id', 'name', 'type', 'size'],
              include: [
                {
                  model: TurfProfile,
                  as: 'turf',
                  attributes: ['id', 'name', 'location']
                }
              ]
            }
          ],
          order: [['date', 'DESC'], ['start_time', 'DESC']]
        })
      ]);

      // Combine academy sessions
      const academyBookings = [...academyBatchBookings, ...academyProgramBookings];

      return {
        coachBookings,
        academyBookings,
        turfBookings
      };
    } catch (err) {
      error('Error finding past user bookings:', err);
      return {
        coachBookings: [],
        academyBookings: [],
        turfBookings: []
      };
    }
  }

  // Create new booking methods
  async createCoachSession(sessionData) {
    try {
      const session = await this.CoachSession.create(sessionData);
      return session;
    } catch (err) {
      error('Error creating coach session:', err);
      throw err;
    }
  }

  async createAcademyBatchSession(sessionData) {
    try {
      const session = await this.AcademyBatchSession.create(sessionData);
      return session;
    } catch (err) {
      error('Error creating academy batch session:', err);
      throw err;
    }
  }

  async createAcademyProgramSession(sessionData) {
    try {
      const session = await this.AcademyProgramSession.create(sessionData);
      return session;
    } catch (err) {
      error('Error creating academy program session:', err);
      throw err;
    }
  }

  async createTurfBooking(bookingData) {
    try {
      const booking = await this.TurfSession.create(bookingData);
      return booking;
    } catch (err) {
      error('Error creating turf booking:', err);
      throw err;
    }
  }

  // Update booking methods
  async updateCoachSession(sessionId, updateData) {
    try {
      const [updatedRowsCount, updatedRows] = await this.CoachSession.update(
        updateData,
        {
          where: { id: sessionId },
          returning: true
        }
      );
      return updatedRows[0];
    } catch (err) {
      error('Error updating coach session:', err);
      throw err;
    }
  }

  async updateAcademyBatchSession(sessionId, updateData) {
    try {
      const [updatedRowsCount, updatedRows] = await this.AcademyBatchSession.update(
        updateData,
        {
          where: { id: sessionId },
          returning: true
        }
      );
      return updatedRows[0];
    } catch (err) {
      error('Error updating academy batch session:', err);
      throw err;
    }
  }

  async updateAcademyProgramSession(sessionId, updateData) {
    try {
      const [updatedRowsCount, updatedRows] = await this.AcademyProgramSession.update(
        updateData,
        {
          where: { id: sessionId },
          returning: true
        }
      );
      return updatedRows[0];
    } catch (err) {
      error('Error updating academy program session:', err);
      throw err;
    }
  }

  async updateTurfBooking(bookingId, updateData) {
    try {
      const [updatedRowsCount, updatedRows] = await this.TurfSession.update(
        updateData,
        {
          where: { id: bookingId },
          returning: true
        }
      );
      return updatedRows[0];
    } catch (err) {
      error('Error updating turf booking:', err);
      throw err;
    }
  }

  // Delete booking methods
  async deleteCoachSession(sessionId) {
    try {
      return await this.CoachSession.destroy({
        where: { id: sessionId }
      });
    } catch (err) {
      error('Error deleting coach session:', err);
      throw err;
    }
  }

  async deleteAcademyBatchSession(sessionId) {
    try {
      return await this.AcademyBatchSession.destroy({
        where: { id: sessionId }
      });
    } catch (err) {
      error('Error deleting academy batch session:', err);
      throw err;
    }
  }

  async deleteAcademyProgramSession(sessionId) {
    try {
      return await this.AcademyProgramSession.destroy({
        where: { id: sessionId }
      });
    } catch (err) {
      error('Error deleting academy program session:', err);
      throw err;
    }
  }

  async deleteTurfBooking(bookingId) {
    try {
      return await this.TurfSession.destroy({
        where: { id: bookingId }
      });
    } catch (err) {
      error('Error deleting turf booking:', err);
      throw err;
    }
  }

// Academy booking methods - Academy Batch Sessions
async findAcademyBatchBookingsByUserId(userId) {
  try {
    return await AcademyBatchSession.findAll({
      where: { 
        user_id: userId 
      },
      include: [
        {
          model: AcademyBatch,
          as: 'batch',
          attributes: ['batchId', 'batchName', 'description', 'sport'], // Changed 'id' to 'batchId' and 'name' to 'batchName'
          required: false,
          include: [
            {
              model: AcademyProfile,
              as: 'academy',
              attributes: ['academyId', 'name', 'sports', 'city', 'description'], // Changed 'id' to 'academyId' and 'sport' to 'sports'
              required: false
            }
          ]
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  } catch (err) {
    console.error('Detailed error in findAcademyBatchBookingsByUserId:', err.message);
    error('Error finding academy batch bookings by user ID:', err);
    return [];
  }
}

// Academy Program Sessions
async findAcademyProgramBookingsByUserId(userId) {
  try {
    return await AcademyProgramSession.findAll({
      where: { 
        user_id: userId 
      },
      include: [
        {
          model: AcademyProgram,
          as: 'program',
          attributes: ['programId', 'programName', 'description', 'sport'], // Changed 'id' to 'programId' and 'name' to 'programName'
          required: false,
          include: [
            {
              model: AcademyProfile,
              as: 'academy',
              attributes: ['academyId', 'name', 'sports', 'city', 'description'], // Changed 'id' to 'academyId' and 'sport' to 'sports'
              required: false
            }
          ]
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  } catch (err) {
    console.error('Detailed error in findAcademyProgramBookingsByUserId:', err.message);
    error('Error finding academy program bookings by user ID:', err);
    return [];
  }
}


// Turf booking methods
async findTurfBookingsByUserId(userId) {
  try {
    return await TurfSession.findAll({
      where: { 
        user_id: userId 
      },
      include: [
        {
          model: TurfGround,
          as: 'ground',
          attributes: ['groundId', 'name', 'sportType', 'dimensions', 'capacity'], // Changed 'id' to 'groundId' and 'type' to 'sportType'
          required: false,
          include: [
            {
              model: TurfProfile,
              as: 'turf',
              attributes: ['turfId', 'name', 'city', 'description'], // Changed 'id' to 'turfId' and 'location' to 'city'
              required: false
            }
          ]
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });
  } catch (err) {
    console.error('Detailed error in findTurfBookingsByUserId:', err.message);
    error('Error finding turf bookings by user ID:', err);
    return [];
  }
}
}

module.exports = new SessionRepository();