const academyRepository = require("./repositories/academyRepository")
const academyFeeRepository = require("./repositories/academyFeeRepository")
const academyProgramRepository = require("./repositories/academyProgramRepository")
const academyBatchRepository = require("./repositories/academyBatchRepository")
const { SupplierService } = require("../supplier/index")
const { v4: uuidv4 } = require("uuid")
const { sequelize } = require("../../database")

const createAcademyProfile = async (supplierId, profileData) => {
  const supplier = await SupplierService.getSupplierByModule(supplierId, "academy")
  if (!supplier) {
    throw new Error("Supplier not found or not configured for academy")
  }

  return await academyRepository.createAcademyProfile({
    ...profileData,
    supplierId,
    academyProfileId: uuidv4(),
  })
}

const getAcademyProfile = async (academyProfileId, options) => {
  const profile = await academyRepository.getAcademyProfileWithDetails(academyProfileId, options)
  if (!profile) throw new Error("Academy profile not found")
  return profile
}

const getAcademiesBySupplier = async (supplierId) => {
  return await academyRepository.findAcademiesBySupplierId(supplierId)
}

const updateAcademyProfile = async (academyProfileId, updateData) => {
  const updated = await academyRepository.updateAcademyProfile(academyProfileId, updateData)
  if (!updated) throw new Error("Academy profile not found")
  return updated
}

const deleteAcademyProfile = async (academyProfileId) => {
  const deleted = await academyRepository.deleteAcademyProfile(academyProfileId)
  if (!deleted) throw new Error("Academy profile not found")

  // Check if supplier has other academies
  const remainingAcademies = await academyRepository.findAcademiesBySupplierId(deleted.supplierId)
  if (remainingAcademies.length === 0) {
    await SupplierService.updateSupplierModule(deleted.supplierId, "none")
  }
  return deleted
}

const getNearbyAcademies = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) throw new Error("Coordinates are required")
  return await academyRepository.findAcademiesNearby(latitude, longitude, radius)
}

// Student-related services
const getAllStudents = async (filters = {}) => {
  return await academyRepository.getAllStudents(filters)
}

const getStudentsByAcademy = async (academyId, filters = {}) => {
  return await academyRepository.getStudentsByAcademy(academyId, filters)
}

const getStudentById = async (studentId) => {
  const student = await academyRepository.getStudentById(studentId)
  if (!student) throw new Error("Student not found")
  return student
}

const createStudent = async (studentData) => {
  // Determine enrollment source based on provided IDs
  let enrollmentSource = "null"
  if (studentData.batchId && studentData.programId) {
    enrollmentSource = "both"
  } else if (studentData.batchId) {
    enrollmentSource = "batch"
  } else if (studentData.programId) {
    enrollmentSource = "program"
  }

  const student = await academyRepository.createStudent({
    ...studentData,
    studentId: uuidv4(),
    enrollmentSource,
    joinedDate: studentData.joinedDate || new Date(),
  })

  // If student is enrolled in a batch, update batch enrollment
  if (student.batchId) {
    await academyBatchRepository.enrollStudent(student.batchId, student.studentId)
  }

  // If student is enrolled in a program, update program enrollment
  if (student.programId) {
    await academyProgramRepository.enrollStudent(student.programId, student.studentId)
  }

  return student
}

const updateStudent = async (studentId, updateData) => {
  const student = await academyRepository.getStudentById(studentId)
  if (!student) throw new Error("Student not found")

  // Handle enrollment source changes
  if (updateData.batchId !== undefined || updateData.programId !== undefined) {
    const newBatchId = updateData.batchId !== undefined ? updateData.batchId : student.batchId
    const newProgramId = updateData.programId !== undefined ? updateData.programId : student.programId

    if (newBatchId && newProgramId) {
      updateData.enrollmentSource = "both"
    } else if (newBatchId) {
      updateData.enrollmentSource = "batch"
    } else if (newProgramId) {
      updateData.enrollmentSource = "program"
    } else {
      updateData.enrollmentSource = "null"
    }

    // Handle batch enrollment changes
    if (updateData.batchId !== undefined && updateData.batchId !== student.batchId) {
      if (student.batchId) {
        // Unenroll from old batch
        await academyBatchRepository.unenrollStudent(student.batchId, studentId)
      }
      if (updateData.batchId) {
        // Enroll in new batch
        await academyBatchRepository.enrollStudent(updateData.batchId, studentId)
      }
    }

    // Handle program enrollment changes
    if (updateData.programId !== undefined && updateData.programId !== student.programId) {
      if (student.programId) {
        // Unenroll from old program
        await academyProgramRepository.unenrollStudent(student.programId, studentId)
      }
      if (updateData.programId) {
        // Enroll in new program
        await academyProgramRepository.enrollStudent(updateData.programId, studentId)
      }
    }
  }

  return await academyRepository.updateStudent(studentId, updateData)
}

const deleteStudent = async (studentId) => {
  const student = await academyRepository.getStudentById(studentId)
  if (!student) throw new Error("Student not found")

  // Unenroll from batch if enrolled
  if (student.batchId) {
    await academyBatchRepository.unenrollStudent(student.batchId, studentId)
  }

  // Unenroll from program if enrolled
  if (student.programId) {
    await academyProgramRepository.unenrollStudent(student.programId, studentId)
  }

  return await academyRepository.deleteStudent(studentId)
}

// Batch-related services
const createBatch = async (batchData) => {
  return await academyBatchRepository.createBatch({
    ...batchData,
    batchId: uuidv4(),
  })
}

const getBatchById = async (batchId) => {
  const batch = await academyBatchRepository.getBatchById(batchId)
  if (!batch) throw new Error("Batch not found")
  return batch
}

const getBatchesByAcademy = async (academyId, filters) => {
  return await academyBatchRepository.getBatchesByAcademy(academyId, filters)
}

const updateBatch = async (batchId, updateData) => {
  const updated = await academyBatchRepository.updateBatch(batchId, updateData)
  if (!updated) throw new Error("Batch not found")
  return updated
}

const deleteBatch = async (batchId) => {
  const deleted = await academyBatchRepository.deleteBatch(batchId)
  if (!deleted) throw new Error("Batch not found")
  return deleted
}

const getBatchStudents = async (batchId) => {
  return await academyBatchRepository.getEnrolledStudents(batchId)
}

const enrollStudentInBatch = async (batchId, studentData) => {
  const transaction = await sequelize.transaction()

  try {
    // Create or update student
    let student
    if (studentData.studentId) {
      // Update existing student
      student = await academyRepository.updateStudent(
        studentData.studentId,
        {
          ...studentData,
          batchId,
          enrollmentSource: studentData.programId ? "both" : "batch",
        },
        transaction,
      )

      if (!student) throw new Error("Student not found")
    } else {
      // Create new student
      student = await academyRepository.createStudent(
        {
          ...studentData,
          studentId: uuidv4(),
          batchId,
          enrollmentSource: studentData.programId ? "both" : "batch",
          joinedDate: new Date(),
        },
        transaction,
      )
    }
    // Enroll student in batch
    await academyBatchRepository.enrollStudent(batchId, student.studentId, transaction)
    console.log("Student enrolled in batch:", student.studentId)
    await transaction.commit()
    return student
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const unEnrollStudentFromBatch = async (batchId, studentId) => {
  const transaction = await sequelize.transaction();

  try {
    // Get student first to check if they're enrolled in this batch
    const student = await academyRepository.getStudentById(studentId);
    if (!student) throw new Error("Student not found");
    if (student.batchId !== batchId) throw new Error("Student not enrolled in this batch");

    // Update student record
    const updatedStudent = await academyRepository.updateStudent(
      studentId,
      {
        batchId: null,
        enrollmentSource: student.programId ? "program" : "null"
      },
      transaction
    );

    // Remove from batch enrollment
    await academyBatchRepository.unenrollStudent(batchId, studentId, transaction);

    await transaction.commit();
    return updatedStudent;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

const getAvailableBatches = async (filters) => {
  return await academyBatchRepository.getAvailableBatches(filters)
}

// Program-related services
const createProgram = async (programData) => {
  return await academyProgramRepository.createProgram({
    ...programData,
    programId: uuidv4(),
  })
}

const getProgramById = async (programId) => {
  const program = await academyProgramRepository.getProgramById(programId)
  if (!program) throw new Error("Program not found")
  return program
}

const getProgramsByAcademy = async (academyId) => {
  return await academyProgramRepository.getProgramsByAcademy(academyId)
}

const updateProgram = async (programId, updateData) => {
  const updated = await academyProgramRepository.updateProgram(programId, updateData)
  if (!updated) throw new Error("Program not found")
  return updated
}

const deleteProgram = async (programId) => {
  const deleted = await academyProgramRepository.deleteProgram(programId)
  if (!deleted) throw new Error("Program not found")
  return deleted
}

const getEnrolledStudents = async (programId) => {
  return await academyProgramRepository.getEnrolledStudents(programId)
}

const enrollStudentInProgram = async (programId, studentData) => {
  const transaction = await sequelize.transaction()

  try {
    // Create or update student
    let student
    if (studentData.studentId) {
      // Update existing student
      student = await academyRepository.updateStudent(
        studentData.studentId,
        {
          ...studentData,
          programId,
          enrollmentSource: studentData.batchId ? "both" : "program",
        },
        transaction,
      )

      if (!student) throw new Error("Student not found")
    } else {
      // Create new student
      student = await academyRepository.createStudent(
        {
          ...studentData,
          studentId: uuidv4(),
          programId,
          enrollmentSource: studentData.batchId ? "both" : "program",
          joinedDate: new Date(),
        },
        transaction,
      )
    }

    // Enroll student in program
    await academyProgramRepository.enrollStudent(programId, student.studentId, transaction)

    await transaction.commit()
    return student
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

const unEnrollStudentFromProgram = async (programId, studentId) => {
  const transaction = await sequelize.transaction();

  try {
    // Get student first to check if they're enrolled in this batch
    const student = await academyRepository.getStudentById(studentId);
    if (!student) throw new Error("Student not found");
    if (student.programId !== programId) throw new Error("Student not enrolled in this program");

    // Update student record
    const updatedStudent = await academyRepository.updateStudent(
      studentId,
      {
        programId: null,
        enrollmentSource: student.batchId ? "batch" : "null"
      },
      transaction
    );

    // Remove from batch enrollment
    await academyProgramRepository.unenrollStudent(programId, studentId, transaction);

    await transaction.commit();
    return updatedStudent;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Fee-related services
const createFee = async (feeData) => {
  // Calculate total amount if not provided
  if (!feeData.totalAmount) {
    const amount = Number.parseFloat(feeData.amount || 0)
    const discount = Number.parseFloat(feeData.discountAmount || 0)
    const tax = Number.parseFloat(feeData.taxAmount || 0)
    feeData.totalAmount = amount - discount + tax
  }

  return await academyFeeRepository.createFee({
    ...feeData,
    feeId: uuidv4(),
  })
}

const getFeeById = async (feeId) => {
  const fee = await academyFeeRepository.getFeeById(feeId)
  if (!fee) throw new Error("Fee record not found")
  return fee
}

const getFeesByStudent = async (studentId) => {
  return await academyFeeRepository.getFeesByStudent(studentId)
}

const getFeesByAcademy = async (academyId, filters) => {
  return await academyFeeRepository.getFeesByAcademy(academyId, filters)
}

const updateFee = async (feeId, updateData) => {
  // If amount components are updated, recalculate total
  if (updateData.amount || updateData.discountAmount || updateData.taxAmount) {
    const fee = await academyFeeRepository.getFeeById(feeId)
    if (!fee) throw new Error("Fee record not found")

    const amount = Number.parseFloat(updateData.amount || fee.amount)
    const discount = Number.parseFloat(updateData.discountAmount || fee.discountAmount)
    const tax = Number.parseFloat(updateData.taxAmount || fee.taxAmount)
    updateData.totalAmount = amount - discount + tax
  }

  const updated = await academyFeeRepository.updateFee(feeId, updateData)
  if (!updated) throw new Error("Fee record not found")
  return updated
}

const deleteFee = async (feeId) => {
  const deleted = await academyFeeRepository.deleteFee(feeId)
  if (!deleted) throw new Error("Fee record not found")
  return deleted
}

const recordFeePayment = async (feeId, paymentData) => {
  const updated = await academyFeeRepository.recordPayment(feeId, paymentData)
  if (!updated) throw new Error("Fee record not found")
  return updated
}

const getOverdueFees = async () => {
  return await academyFeeRepository.getOverdueFees()
}

module.exports = {
  createAcademyProfile,
  getAcademyProfile,
  getAcademiesBySupplier,
  updateAcademyProfile,
  deleteAcademyProfile,
  getNearbyAcademies,
  // Student-related exports
  getAllStudents,
  getStudentsByAcademy,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  // Batch-related exports
  createBatch,
  getBatchById,
  getBatchesByAcademy,
  updateBatch,
  deleteBatch,
  getBatchStudents,
  enrollStudentInBatch,
  unEnrollStudentFromBatch,
  getAvailableBatches,
  // Program-related exports
  createProgram,
  getProgramById,
  getProgramsByAcademy,
  updateProgram,
  deleteProgram,
  getEnrolledStudents,
  enrollStudentInProgram,
  unEnrollStudentFromProgram,
  // Fee-related exports
  createFee,
  getFeeById,
  getFeesByStudent,
  getFeesByAcademy,
  updateFee,
  deleteFee,
  recordFeePayment,
  getOverdueFees,
}
