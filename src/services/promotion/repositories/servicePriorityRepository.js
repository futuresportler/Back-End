const { CoachProfile, AcademyProfile, TurfProfile, sequelize } = require("../../../database");

class ServicePriorityRepository {
  async updateServicePriority(serviceType, serviceId, priorityData) {
    const { value, plan, expiresAt } = priorityData;
    const priority = { value, plan, expiresAt };

    switch (serviceType) {
      case "coach":
        return await CoachProfile.update(
          { priority },
          { where: { coachId: serviceId } }
        );
      case "academy":
        return await AcademyProfile.update(
          { priority },
          { where: { academyId: serviceId } }
        );
      case "turf":
        return await TurfProfile.update(
          { priority },
          { where: { turfId: serviceId } }
        );
      default:
        throw new Error("Invalid service type");
    }
  }

  async resetServicePriority(serviceType, serviceId) {
    const priority = { value: 0, plan: "none", expiresAt: null };

    switch (serviceType) {
      case "coach":
        return await CoachProfile.update(
          { priority },
          { where: { coachId: serviceId } }
        );
      case "academy":
        return await AcademyProfile.update(
          { priority },
          { where: { academyId: serviceId } }
        );
      case "turf":
        return await TurfProfile.update(
          { priority },
          { where: { turfId: serviceId } }
        );
      default:
        throw new Error("Invalid service type");
    }
  }

  async getServicesWithExpiredPromotions() {
    const currentDate = new Date().toISOString();
    
    const expiredCoaches = await CoachProfile.findAll({
      where: sequelize.where(
        sequelize.cast(sequelize.json("priority.expiresAt"), "timestamp"),
        { [sequelize.Op.lt]: currentDate }
      ),
      attributes: ["coachId", "priority"]
    });

    const expiredAcademies = await AcademyProfile.findAll({
      where: sequelize.where(
        sequelize.cast(sequelize.json("priority.expiresAt"), "timestamp"),
        { [sequelize.Op.lt]: currentDate }
      ),
      attributes: ["academyId", "priority"]
    });

    const expiredTurfs = await TurfProfile.findAll({
      where: sequelize.where(
        sequelize.cast(sequelize.json("priority.expiresAt"), "timestamp"),
        { [sequelize.Op.lt]: currentDate }
      ),
      attributes: ["turfId", "priority"]
    });

    return {
      coaches: expiredCoaches.map(c => ({ serviceId: c.coachId, serviceType: "coach" })),
      academies: expiredAcademies.map(a => ({ serviceId: a.academyId, serviceType: "academy" })),
      turfs: expiredTurfs.map(t => ({ serviceId: t.turfId, serviceType: "turf" }))
    };
  }
}

module.exports = new ServicePriorityRepository();