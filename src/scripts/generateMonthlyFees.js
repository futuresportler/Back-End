const AcademyService = require("../services/academy")
const { sequelize } = require("../database")
const { info, error } = require("../config/logging")
const { v4: uuidv4 } = require("uuid")

/**
 * Generates fees for all students in all academies
 * This script is designed to be run as a scheduled task during the last week of each month
 */
async function generateMonthlyFees() {
  info("Starting monthly fee generation process")

  try {
    // Get all academy profiles
    const academies = await getAllAcademies()
    info(`Found ${academies.length} academies`)

    let totalFeesGenerated = 0

    // Process each academy
    for (const academy of academies) {
      info(`Processing academy: ${academy.academyName} (${academy.academyProfileId})`)
      const feesGenerated = await processAcademy(academy)
      totalFeesGenerated += feesGenerated
    }

    info(`Fee generation completed. Total fees generated: ${totalFeesGenerated}`)
    return { success: true, totalFeesGenerated }
  } catch (err) {
    error(`Error in fee generation process: ${err.message}`)
    error(err.stack)
    return { success: false, error: err.message }
  }
}

/**
 * Get all active academies
 */
async function getAllAcademies() {
  // This would need to be implemented in the academy repository
  // For now, we'll use a direct query
  return await sequelize.models.AcademyProfile.findAll({
    where: { status: "active" },
  })
}

/**
 * Process a single academy
 */
async function processAcademy(academy) {
  let feesGenerated = 0

  try {
    // Get all batches for this academy
    const batches = await AcademyService.getBatchesByAcademy(academy.academyProfileId, { status: "active" })
    info(`Found ${batches.length} active batches for academy ${academy.academyName}`)

    // Get all programs for this academy
    const programs = await AcademyService.getProgramsByAcademy(academy.academyProfileId)
    info(`Found ${programs.length} active programs for academy ${academy.academyName}`)

    // Process batches
    for (const batch of batches) {
      const batchFeesGenerated = await processBatch(batch, academy)
      feesGenerated += batchFeesGenerated
    }

    // Process programs
    for (const program of programs) {
      if (program.status === "active") {
        const programFeesGenerated = await processProgram(program, academy)
        feesGenerated += programFeesGenerated
      }
    }

    return feesGenerated
  } catch (err) {
    error(`Error processing academy ${academy.academyName}: ${err.message}`)
    throw err
  }
}

/**
 * Process a single batch
 */
async function processBatch(batch, academy) {
  try {
    // Get all students in this batch
    const students = await AcademyService.getBatchStudents(batch.batchId)
    info(`Processing ${students.length} students in batch ${batch.batchName}`)

    let feesGenerated = 0

    // Generate fees for each student
    for (const student of students) {
      await generateStudentFee(student, academy, batch, null)
      feesGenerated++
    }

    return feesGenerated
  } catch (err) {
    error(`Error processing batch ${batch.batchName}: ${err.message}`)
    throw err
  }
}

/**
 * Process a single program
 */
async function processProgram(program, academy) {
  try {
    // Get all students in this program
    const students = await AcademyService.getEnrolledStudents(program.programId)
    info(`Processing ${students.length} students in program ${program.programName}`)

    let feesGenerated = 0

    // Generate fees for each student
    for (const student of students) {
      // Skip students who are already processed via batch (to avoid duplicate fees)
      if (student.enrollmentSource !== "both") {
        await generateStudentFee(student, academy, null, program)
        feesGenerated++
      }
    }

    return feesGenerated
  } catch (err) {
    error(`Error processing program ${program.programName}: ${err.message}`)
    throw err
  }
}

/**
 * Generate a fee for a single student
 */
async function generateStudentFee(student, academy, batch, program) {
  const transaction = await sequelize.transaction()

  try {
    // Determine fee amount and details based on batch or program
    let feeAmount, description, dueDate, feeType, batchId, programId

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(10) // Due on the 10th of next month

    if (batch) {
      feeAmount = batch.fee
      description = `Monthly fee for ${batch.batchName} - ${getMonthName(nextMonth)}`
      dueDate = nextMonth
      feeType = "monthly"
      batchId = batch.batchId
      programId = null
    } else if (program) {
      feeAmount = program.fee
      description = `Monthly fee for ${program.programName} - ${getMonthName(nextMonth)}`
      dueDate = nextMonth
      feeType = "monthly"
      batchId = null
      programId = program.programId
    } else {
      throw new Error("Either batch or program must be provided")
    }

    // Check if a fee already exists for this student for next month
    const existingFees = await sequelize.models.AcademyFee.findAll({
      where: {
        studentId: student.studentId,
        academyId: academy.academyProfileId,
        feeType: "monthly",
        issueDate: {
          [sequelize.Op.gte]: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
          [sequelize.Op.lt]: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1),
        },
      },
      transaction,
    })

    if (existingFees.length > 0) {
      info(`Fee already exists for student ${student.studentId} for ${getMonthName(nextMonth)}. Skipping.`)
      await transaction.commit()
      return null
    }

    // Create fee record
    const feeData = {
      feeId: uuidv4(),
      studentId: student.studentId,
      academyId: academy.academyProfileId,
      programId,
      batchId,
      feeType,
      description,
      amount: feeAmount,
      discountAmount: 0, // Can be customized based on student discounts
      taxAmount: 0, // Can be customized based on tax rules
      totalAmount: feeAmount, // Will be recalculated in the service
      issueDate: new Date(),
      dueDate,
      status: "pending",
      notes: `Automatically generated on ${new Date().toISOString()}`,
    }

    const fee = await AcademyService.createFee(feeData)

    info(`Generated fee ${fee.feeId} for student ${student.studentId} in academy ${academy.academyName}`)

    await transaction.commit()
    return fee
  } catch (err) {
    await transaction.rollback()
    error(`Error generating fee for student ${student.studentId}: ${err.message}`)
    throw err
  }
}

/**
 * Get month name from date
 */
function getMonthName(date) {
  return date.toLocaleString("default", { month: "long", year: "numeric" })
}

module.exports = generateMonthlyFees
