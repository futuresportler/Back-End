const {
  AcademyProfile,
  Supplier,
  AcademyStudent,
  sequelize,
  AcademyBatch,
  AcademyProgram,
  AcademyCoach,
  AcademyFee,
} = require("../../../database")

const createAcademyProfile = async (profileData) => {
  return await AcademyProfile.create(profileData)
}

const findAcademyProfileById = async (academyProfileId) => {
  return await AcademyProfile.findByPk(academyProfileId)
}

async function getAcademyProfileWithDetails(
  academyProfileId,
  {
    includeBatches = false,
    includePrograms = false,
    includeCoaches = false,
    includeStudents = false,
    includeFees = false,
  } = {},
) {
  const include = []

  if (includeBatches) {
    include.push({ model: AcademyBatch, as: "AcademyBatches" });
  }
  if (includePrograms) {
    include.push({ model: AcademyProgram, as: "AcademyPrograms" });
  }
  if (includeCoaches) {
    include.push({ model: AcademyCoach, as: "AcademyCoaches" });
  }
  if (includeStudents) {
    include.push({ model: AcademyStudent, as: "AcademyStudents" });
  }
  if (includeFees) {
    include.push({ model: AcademyFee, as: "AcademyFees" });
  }

  const academyProfile = await AcademyProfile.findByPk(academyProfileId, {
    include,
  })

  if (!academyProfile) {
    throw new Error(`AcademyProfile with ID ${academyProfileId} not found`)
  }

  return academyProfile
}

const findAcademiesBySupplierId = async (supplierId) => {
  return await AcademyProfile.findAll({
    where: { supplierId },
    include: ["supplier"],
  })
}

const updateAcademyProfile = async (academyProfileId, updateData) => {
  const profile = await AcademyProfile.findByPk(academyProfileId)
  if (!profile) return null
  return await profile.update(updateData)
}

const deleteAcademyProfile = async (academyProfileId) => {
  const academy = await AcademyProfile.findByPk(academyProfileId)
  if (!academy) return null
  await academy.destroy()
  return academy
}

const findAcademiesNearby = async (latitude, longitude, radius) => {
  return await AcademyProfile.findAll({
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


// Student-related repository methods
const createStudent = async (studentData, transaction = null) => {
  return await AcademyStudent.create(studentData, { transaction })
}

const updateStudent = async (studentId, updateData, transaction = null) => {
  const student = await AcademyStudent.findByPk(studentId, { transaction })
  if (!student) return null
  return await student.update(updateData, { transaction })
}

const getStudentById = async (studentId) => {
  return await AcademyStudent.findByPk(studentId, {
    include: [
      { model: AcademyBatch, as: "batch", attributes: ["batchId", "batchName"] },
      { model: AcademyProgram, as: "program", attributes: ["programId", "programName"] },
    ],
  })
}

const getStudentsByAcademy = async (academyId, filters = {}) => {
  const { name, sport, status, batchId, programId, page = 1, limit = 20 } = filters

  const where = { academyId }

  if (name) {
    where.name = { [sequelize.Op.iLike]: `%${name}%` }
  }

  if (sport) {
    where.sport = sport
  }

  if (status) {
    where.status = status
  }

  if (batchId) {
    where.batchId = batchId
  }

  if (programId) {
    where.programId = programId
  }

  const offset = (page - 1) * limit

  const { count, rows } = await AcademyStudent.findAndCountAll({
    where,
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
    include: [
      { model: AcademyBatch, as: "batch", attributes: ["batchId", "name"] },
      { model: AcademyProgram, as: "program", attributes: ["programId", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  })

  return {
    students: rows,
    pagination: {
      total: count,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  }
}

const getStudentsByProgram = async (programId) => {
  return await AcademyStudent.findAll({
    where: { programId },
  })
}

const deleteStudent = async (studentId) => {
  const student = await AcademyStudent.findByPk(studentId)
  if (!student) return null
  await student.destroy()
  return student
}

module.exports = {
  createAcademyProfile,
  findAcademyProfileById,
  getAcademyProfileWithDetails,
  findAcademiesBySupplierId,
  updateAcademyProfile,
  deleteAcademyProfile,
  findAcademiesNearby,
  // Student-related exports
  createStudent,
  updateStudent,
  getStudentById,
  getStudentsByAcademy,
  getStudentsByProgram,
  deleteStudent,
}
