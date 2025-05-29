const { AcademyFee, sequelize } = require("../../../database")
const { Op } = require("sequelize")

class AcademyFeeRepository {
  /**
   * Create a new fee record
   * @param {Object} feeData - Fee data
   * @returns {Promise<Object>} Created fee
   */
  async createFee(feeData) {
    return await AcademyFee.create(feeData)
  }

  /**
   * Get fee by ID
   * @param {string} feeId - Fee ID
   * @returns {Promise<Object>} Fee details
   */
  async getFeeById(feeId) {
    return await AcademyFee.findByPk(feeId)
  }

  /**
   * Get fees by student ID
   * @param {string} studentId - Student ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of fees
   */
  async getFeesByStudentId(studentId, filters = {}) {
    const whereClause = {
      studentId,
      ...filters,
    }

    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "DESC"]],
    })
  }

  /**
   * Get fees by academy ID
   * @param {string} academyId - Academy ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of fees
   */
  async getFeesByAcademyId(academyId, filters = {}) {
    const whereClause = {
      academyId,
      ...filters,
    }

    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "DESC"]],
    })
  }

  /**
   * Get fees by program ID
   * @param {string} programId - Program ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of fees
   */
  async getFeesByProgramId(programId, filters = {}) {
    const whereClause = {
      programId,
      ...filters,
    }

    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "DESC"]],
    })
  }
  /**
   * Get fees by program ID with date filters
   * @param {string} programId - Program ID
   * @param {Object} filters - Optional filters including createdAfter, createdBefore, status
   * @returns {Promise<Array>} List of fees
   */
  async getFeesByProgram(programId, filters = {}) {
    const { createdAfter, createdBefore, status } = filters;
    const whereClause = { programId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (createdAfter || createdBefore) {
      whereClause.createdAt = {};
      
      if (createdAfter) {
        whereClause.createdAt[Op.gte] = createdAfter;
      }
      
      if (createdBefore) {
        whereClause.createdAt[Op.lt] = createdBefore;
      }
    }
    
    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "DESC"]],
    });
  }
  /**
   * Get fees by batch ID
   * @param {string} batchId - Batch ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of fees
   */
  async getFeesByBatchId(batchId, filters = {}) {
    const whereClause = {
      batchId,
      ...filters,
    }

    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "DESC"]],
    })
  }

  /**
   * Update fee details
   * @param {string} feeId - Fee ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated fee
   */
  async updateFee(feeId, updateData) {
    const fee = await AcademyFee.findByPk(feeId)
    if (!fee) {
      throw new Error("Fee not found")
    }

    return await fee.update(updateData)
  }

  /**
   * Record payment for a fee
   * @param {string} feeId - Fee ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Updated fee
   */
  async recordPayment(feeId, paymentData) {
    const { amount, paymentMethod, transactionId } = paymentData

    return await sequelize.transaction(async (t) => {
      const fee = await AcademyFee.findByPk(feeId, { transaction: t })
      if (!fee) {
        throw new Error("Fee not found")
      }

      // Update paid amount
      const newPaidAmount = Number.parseFloat(fee.paidAmount) + Number.parseFloat(amount)
      const totalAmount = Number.parseFloat(fee.totalAmount)

      // Determine new status
      let newStatus = fee.status
      if (newPaidAmount >= totalAmount) {
        newStatus = "paid"
      } else if (newPaidAmount > 0) {
        newStatus = "partial"
      }

      // Add transaction ID to the list
      const transactionIds = [...fee.transactionIds]
      if (transactionId) {
        transactionIds.push(transactionId)
      }

      // Update fee record
      return await fee.update(
        {
          paidAmount: newPaidAmount,
          status: newStatus,
          lastPaymentDate: new Date(),
          paymentMethod,
          transactionIds,
        },
        { transaction: t },
      )
    })
  }

  /**
   * Get overdue fees
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of overdue fees
   */
  async getOverdueFees(filters = {}) {
    const whereClause = {
      dueDate: { [Op.lt]: new Date() },
      status: { [Op.in]: ["pending", "partial"] },
      ...filters,
    }

    return await AcademyFee.findAll({
      where: whereClause,
      order: [["dueDate", "ASC"]],
    })
  }

  /**
   * Delete fee
   * @param {string} feeId - Fee ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFee(feeId) {
    const fee = await AcademyFee.findByPk(feeId)
    if (!fee) {
      throw new Error("Fee not found")
    }

    await fee.destroy()
    return true
  }
}

module.exports = new AcademyFeeRepository()
