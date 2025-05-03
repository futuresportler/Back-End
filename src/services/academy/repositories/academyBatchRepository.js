const { AcademyBatch, AcademyStudent, sequelize } = require("../../../database")
const { Op } = require("sequelize")

const createBatch = async (batchData) => {
  return await AcademyBatch.create(batchData)
}

const getBatchById = async (batchId) => {
  return await AcademyBatch.findByPk(batchId)
}

const getBatchesByAcademy = async (academyId, filters = {}) => {
  const where = { academyId }

  // Apply filters
  if (filters.status) {
    where.status = filters.status
  }

  if (filters.sport) {
    where.sport = filters.sport
  }

  if (filters.ageGroup) {
    where.ageGroup = filters.ageGroup
  }

  return await AcademyBatch.findAll({
    where,
    order: [["createdAt", "DESC"]],
  })
}

const updateBatch = async (batchId, updateData) => {
  const batch = await AcademyBatch.findByPk(batchId)
  if (!batch) return null
  return await batch.update(updateData)
}

const deleteBatch = async (batchId) => {
  const batch = await AcademyBatch.findByPk(batchId)
  if (!batch) return null
  await batch.destroy()
  return batch
}

const getEnrolledStudents = async (batchId) => {
  const batch = await AcademyBatch.findByPk(batchId)
  if (!batch) throw new Error("Batch not found")

  return await AcademyStudent.findAll({
    where: {
      batchId,
    },
  })
}

const enrollStudent = async (batchId, studentId, transaction = null) => {
  const batch = await AcademyBatch.findByPk(batchId, { transaction })
  if (!batch) throw new Error("Batch not found")

  // Check if student is already enrolled
  if (batch.enrolledStudents.includes(studentId)) {
    return batch
  }

  // Add student to batch
  const updatedEnrolledStudents = [...batch.enrolledStudents, studentId]
  const updatedTotalStudents = batch.totalStudents + 1

  // Check if batch is full
  if (updatedTotalStudents > batch.maxStudents) {
    throw new Error("Batch is full")
  }

  return await batch.update(
    {
      enrolledStudents: updatedEnrolledStudents,
      totalStudents: updatedTotalStudents,
    },
    { transaction },
  )
}

const unenrollStudent = async (batchId, studentId, transaction = null) => {
  const batch = await AcademyBatch.findByPk(batchId, { transaction })
  if (!batch) throw new Error("Batch not found")

  // Check if student is enrolled
  if (!batch.enrolledStudents.includes(studentId)) {
    return batch
  }

  // Remove student from batch
  const updatedEnrolledStudents = batch.enrolledStudents.filter((id) => id !== studentId)
  const updatedTotalStudents = batch.totalStudents - 1

  return await batch.update(
    {
      enrolledStudents: updatedEnrolledStudents,
      totalStudents: updatedTotalStudents,
    },
    { transaction },
  )
}

const getAvailableBatches = async (filters = {}) => {
  // Validate filters first
  if (filters.batchId) {
    throw new Error("Invalid filter: batchId is not allowed in getAvailableBatches");
  }

  // Create a clean where object with only allowed filters
  const allowedFilters = ['academyId', 'sport', 'ageGroup', 'daysOfWeek'];
  const where = {
    status: "active",
    totalStudents: {
      [Op.lt]: sequelize.col("maxStudents"),
    },
  };

  allowedFilters.forEach(filter => {
    if (filters[filter]) {
      where[filter] = filters[filter];
    }
  });

  // Handle daysOfWeek specifically
  if (filters.daysOfWeek && filters.daysOfWeek.length > 0) {
    where.daysOfWeek = {
      [Op.overlap]: filters.daysOfWeek,
    };
  }

  return await AcademyBatch.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  createBatch,
  getBatchById,
  getBatchesByAcademy,
  updateBatch,
  deleteBatch,
  getEnrolledStudents,
  enrollStudent,
  unenrollStudent,
  getAvailableBatches,
}
