const { CoachProfile, CoachBatch, CoachStudent, CoachPayment, User, Supplier, sequelize } = require("../../../database")

const findCoachProfileById = async (coachProfileId) => {
  return await CoachProfile.findByPk(coachProfileId, {
    include: [
      {
        model: Supplier,
        as: "supplier",
        attributes: ["email", "mobile_number", "profilePicture", "location"],
      },
    ],
  })
}

const findCoachBySupplierId = async (supplierId) => {
  return await CoachProfile.findOne({
    where: { supplierId },
    include: ["supplier"],
  })
}

const createCoachProfile = async (profileData) => {
  return await CoachProfile.create(profileData)
}

const updateCoachProfile = async (coachProfileId, updateData) => {
  const profile = await CoachProfile.findByPk(coachProfileId)
  if (!profile) return null
  return await profile.update(updateData)
}

const deleteCoachProfile = async (coachProfileId) => {
  const profile = await CoachProfile.findByPk(coachProfileId)
  if (!profile) return null
  await profile.destroy()
  return profile
}

const findCoachesNearby = async (latitude, longitude, radius) => {
  return await CoachProfile.findAll({
    include: [
      {
        model: Supplier,
        as: "supplier",
        where: sequelize.where(
          sequelize.fn(
            "ST_DWithin",
            sequelize.col("supplier.location"),
            sequelize.fn("ST_SetSRID", sequelize.fn("ST_MakePoint", longitude, latitude), 4326),
            radius,
          ),
          true,
        ),
      },
    ],
  })
}

// Batch related functions
const findCoachBatchById = async (batchId) => {
  return await CoachBatch.findByPk(batchId, {
    include: [
      {
        model: CoachProfile,
        as: "coach",
        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: ["email", "mobile_number", "profilePicture", "location"],
          },
        ],
      },
    ],
  })
}

const findCoachBatches = async (coachId) => {
  return await CoachBatch.findAll({
    where: { coachId },
    order: [["createdAt", "DESC"]],
  })
}

const createCoachBatch = async (batchData) => {
  return await CoachBatch.create(batchData)
}

const updateCoachBatch = async (batchId, updateData) => {
  const batch = await CoachBatch.findByPk(batchId)
  if (!batch) return null
  return await batch.update(updateData)
}

const deleteCoachBatch = async (batchId) => {
  const batch = await CoachBatch.findByPk(batchId)
  if (!batch) return null
  await batch.destroy()
  return batch
}

// Student related functions
const findStudentsByBatch = async (batchId) => {
  return await CoachStudent.findAll({
    where: { batchId },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["userId", "first_name", "last_name", "email", "profile_picture"],
      },
    ],
  })
}

const addStudentToBatch = async (batchId, userId, coachId, studentData = {}) => {
  // First, check if the batch exists and has space
  const batch = await CoachBatch.findByPk(batchId)
  if (!batch) throw new Error("Batch not found")

  if (batch.currentStudents >= batch.maxStudents) {
    throw new Error("Batch is full")
  }

  // Check if student is already in this coach's roster
  let student = await CoachStudent.findOne({
    where: { coachId, userId },
  })

  if (student) {
    // Update existing student record
    student = await student.update({
      batchId,
      ...studentData,
    })
  } else {
    // Create new student record
    student = await CoachStudent.create({
      coachId,
      userId,
      batchId,
      ...studentData,
    })
  }

  // Update batch current students count
  await updateCoachBatch(batchId, {
    currentStudents: batch.currentStudents + 1,
  })

  return student
}

const removeStudentFromBatch = async (batchId, userId) => {
  const student = await CoachStudent.findOne({
    where: { batchId, userId },
  })

  if (!student) throw new Error("Student not found in this batch")

  // Update student record to remove batch association
  await student.update({ batchId: null })

  // Update batch current students count
  const batch = await CoachBatch.findByPk(batchId)
  if (batch) {
    await updateCoachBatch(batchId, {
      currentStudents: batch.currentStudents - 1,
    })
  }

  return student
}

// Payment related functions
const createBatchPayment = async (paymentData) => {
  return await CoachPayment.create(paymentData)
}

const findBatchPayments = async (batchId) => {
  return await CoachPayment.findAll({
    where: { batchId },
    include: [
      {
        model: User,
        attributes: ["userId", "first_name", "last_name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
}

module.exports = {
  findCoachProfileById,
  findCoachBySupplierId,
  createCoachProfile,
  updateCoachProfile,
  deleteCoachProfile,
  findCoachesNearby,

  // Add the new batch functions
  findCoachBatchById,
  findCoachBatches,
  createCoachBatch,
  updateCoachBatch,
  deleteCoachBatch,

  // Add the new student functions
  findStudentsByBatch,
  addStudentToBatch,
  removeStudentFromBatch,

  // Add the new payment functions
  createBatchPayment,
  findBatchPayments,
}
