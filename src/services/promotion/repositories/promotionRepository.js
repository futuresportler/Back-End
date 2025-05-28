const { PromotionTransaction, Supplier, sequelize } = require("../../../database");
const { Op } = require("sequelize");

class PromotionRepository {
  async createPromotionTransaction(transactionData) {
    return await PromotionTransaction.create(transactionData);
  }

  async findPromotionById(promotionTransactionId) {
    return await PromotionTransaction.findByPk(promotionTransactionId, {
      include: [{
        model: Supplier,
        as: "supplier",
        attributes: ["name", "email", "mobile_number"]
      }]
    });
  }

  async findPromotionsBySupplier(supplierId, filters = {}) {
    const where = { supplierId };
    
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }

    return await PromotionTransaction.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: filters.limit || 50
    });
  }

  async findActivePromotions(serviceType, serviceIds) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return await PromotionTransaction.findAll({
      where: {
        serviceType,
        serviceId: { [Op.in]: serviceIds },
        status: "paid",
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate }
      }
    });
  }

  async findExpiredPromotions() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return await PromotionTransaction.findAll({
      where: {
        status: "paid",
        endDate: { [Op.lt]: currentDate }
      }
    });
  }

  async updatePromotionStatus(promotionTransactionId, updateData) {
    const promotion = await PromotionTransaction.findByPk(promotionTransactionId);
    if (!promotion) return null;
    return await promotion.update(updateData);
  }

  async recordPromotionPayment(promotionTransactionId, paymentData) {
    const { paymentMethod, transactionId } = paymentData;
    
    return await sequelize.transaction(async (t) => {
      const promotion = await PromotionTransaction.findByPk(promotionTransactionId, { transaction: t });
      if (!promotion) {
        throw new Error("Promotion transaction not found");
      }

      return await promotion.update({
        status: "paid",
        paymentMethod,
        transactionId,
        updatedAt: new Date()
      }, { transaction: t });
    });
  }

  async getPromotionAnalytics(supplierId, period = 6) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - period);

    return await PromotionTransaction.findAll({
      where: {
        supplierId,
        createdAt: { [Op.gte]: cutoffDate }
      },
      attributes: [
        'serviceType',
        'promotionPlan',
        [sequelize.fn('COUNT', sequelize.col('promotion_transaction_id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['serviceType', 'promotionPlan'],
      raw: true
    });
  }
}

module.exports = new PromotionRepository();