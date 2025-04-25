const { v4: uuidv4 } = require("uuid")
const { sequelize } = require("../../config/database")
const coachRepository = require("./repositories/coachRepository")
const { SupplierService } = require("../supplier/index")

const getCoachProfile = async (coachProfileId) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId)
  if (!profile) {
    throw new Error("Coach profile not found")
  }
  return profile
}

const getCoachBySupplier = async (supplierId) => {
  const profile = await coachRepository.findCoachBySupplierId(supplierId)
  if (!profile) {
    throw new Error("No coach profile found for this supplier")
  }
  return profile
}

const updateCoachProfile = async (coachProfileId, updateData) => {
  const updated = await coachRepository.updateCoachProfile(coachProfileId, updateData)
  if (!updated) {
    throw new Error("Coach profile not found")
  }
  return updated
}

const deleteCoachProfile = async (coachProfileId) => {
  const deleted = await coachRepository.deleteCoachProfile(coachProfileId)
  if (!deleted) {
    throw new Error("Coach profile not found")
  }

  // Reset supplier module if needed
  await SupplierService.updateSupplierModule(deleted.supplierId, "coach", false)
  return deleted
}

const getNearbyCoaches = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) {
    throw new Error("Coordinates are required")
  }
  return await coachRepository.findCoachesNearby(latitude, longitude, radius)
}

const addCoachCertification = async (coachProfileId, certificationData) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId)
  if (!profile) {
    throw new Error("Coach profile not found")
  }

  // Add certification to the certifications array
  const updatedCertifications = [...(profile.certifications || []), certificationData]

  return await coachRepository.updateCoachProfile(coachProfileId, {
    certifications: updatedCertifications,
  })
}

// Weekly slot management
const createWeeklySlots = async (coachId, slotData) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  // Validate slot data
  if (slotData.startTime >= slotData.endTime) {
    throw new Error("End time must be after start time")
  }

  // Create the weekly slot
  return await coachRepository.createCoachSlot({
    ...slotData,
    coachId,
    isRecurring: true,
  })
}

const getCoachWeeklySchedule = async (coachId) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  return await coachRepository.findCoachWeeklySlots(coachId)
}

const updateWeeklySlot = async (slotId, updateData) => {
  const slot = await coachRepository.findCoachSlotById(slotId)
  if (!slot) {
    throw new Error("Slot not found")
  }

  if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
    throw new Error("End time must be after start time")
  }

  return await coachRepository.updateCoachSlot(slotId, updateData)
}

const deleteWeeklySlot = async (slotId) => {
  const slot = await coachRepository.findCoachSlotById(slotId)
  if (!slot) {
    throw new Error("Slot not found")
  }

  return await coachRepository.deleteCoachSlot(slotId)
}

// Student management
const addStudent = async (coachId, userId, studentData) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  // Check if student already exists
  const existingStudent = await coachRepository.findCoachStudent(coachId, userId)
  if (existingStudent) {
    throw new Error("Student already added to this coach")
  }

  // Add student
  const student = await coachRepository.createCoachStudent({
    coachId,
    userId,
    ...studentData,
  })

  // Update coach total students count
  await coachRepository.updateCoachProfile(coachId, {
    totalStudents: sequelize.literal("totalStudents + 1"),
  })

  return student
}

const getCoachStudents = async (coachId) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  return await coachRepository.findCoachStudents(coachId)
}

const updateStudentProgress = async (coachId, userId, progressData) => {
  const student = await coachRepository.findCoachStudent(coachId, userId)
  if (!student) {
    throw new Error("Student not found for this coach")
  }

  return await coachRepository.updateCoachStudent(student.id, progressData)
}

// Monthly metrics and summaries
const getMonthlyMetrics = async (coachId, monthId) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  let metrics = await coachRepository.findMonthlyCoachMetric(coachId, monthId)
  if (!metrics) {
    // Create empty metrics if none exist
    metrics = await coachRepository.createMonthlyCoachMetric({
      coachId,
      monthId,
    })
  }

  return metrics
}

const updateMonthlyMetrics = async (coachId, monthId, metricsData) => {
  const coach = await coachRepository.findCoachProfileById(coachId)
  if (!coach) {
    throw new Error("Coach profile not found")
  }

  let metrics = await coachRepository.findMonthlyCoachMetric(coachId, monthId)
  if (!metrics) {
    metrics = await coachRepository.createMonthlyCoachMetric({
      coachId,
      monthId,
      ...metricsData,
    })
  } else {
    metrics = await coachRepository.updateMonthlyCoachMetric(metrics.metricId, metricsData)
  }

  return metrics
}

const getStudentMonthlyProgress = async (coachId, userId, monthId) => {
  const student = await coachRepository.findCoachStudent(coachId, userId)
  if (!student) {
    throw new Error("Student not found for this coach")
  }

  let progress = await coachRepository.findMonthlyStudentProgress(coachId, userId, monthId)
  if (!progress) {
    // Create empty progress if none exists
    progress = await coachRepository.createMonthlyStudentProgress({
      coachId,
      userId,
      monthId,
    })
  }

  return progress
}

const updateStudentMonthlyProgress = async (coachId, userId, monthId, progressData) => {
  const student = await coachRepository.findCoachStudent(coachId, userId)
  if (!student) {
    throw new Error("Student not found for this coach")
  }

  let progress = await coachRepository.findMonthlyStudentProgress(coachId, userId, monthId)
  if (!progress) {
    progress = await coachRepository.createMonthlyStudentProgress({
      coachId,
      userId,
      monthId,
      ...progressData,
    })
  } else {
    progress = await coachRepository.updateMonthlyStudentProgress(progress.progressId, progressData)
  }

  return progress
}

module.exports = {
  getCoachProfile,
  getCoachBySupplier,
  updateCoachProfile,
  deleteCoachProfile,
  getNearbyCoaches,
  addCoachCertification,

  // Weekly slot management
  createWeeklySlots,
  getCoachWeeklySchedule,
  updateWeeklySlot,
  deleteWeeklySlot,

  // Student management
  addStudent,
  getCoachStudents,
  updateStudentProgress,

  // Monthly metrics and summaries
  getMonthlyMetrics,
  updateMonthlyMetrics,
  getStudentMonthlyProgress,
  updateStudentMonthlyProgress,
}
