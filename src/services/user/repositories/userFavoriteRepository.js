const { UserFavorite, AcademyProfile, CoachProfile, TurfProfile, Supplier } = require("../../../database");
const { Op } = require("sequelize");

class UserFavoriteRepository {
  
  async addFavorite(userId, entityType, entityId, supplierId) {
    // Check if already exists
    const existing = await UserFavorite.findOne({
      where: { userId, entityType, entityId }
    });

    if (existing) {
      throw new Error("This item is already in favorites");
    }

    return await UserFavorite.create({
      userId,
      entityType,
      entityId,
      supplierId
    });
  }

  async removeFavorite(userId, entityType, entityId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, entityType, entityId }
    });

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favorite.destroy();
    return favorite;
  }

  async getUserFavorites(userId, entityType = null) {
    const where = { userId };
    
    if (entityType) {
      where.entityType = entityType;
    }

    const favorites = await UserFavorite.findAll({
      where,
      include: [
        {
          model: AcademyProfile,
          as: "academy",
          required: false,
          attributes: [
            "academyId", "name", "description", "sports", 
            "rating", "reviewsCount", "photos", "city", "address"
          ],
          include: [{
            model: Supplier,
            as: "supplier",
            attributes: ["name", "location"]
          }]
        },
        {
          model: CoachProfile,
          as: "coach",
          required: false,
          attributes: [
            "coachId", "name", "bio", "sportsCoached", "experienceYears",
            "rating", "totalReviews", "hourlyRate", "photos", "city"
          ],
          include: [{
            model: Supplier,
            as: "supplier",
            attributes: ["name", "location"]
          }]
        },
        {
          model: TurfProfile,
          as: "turf",
          required: false,
          attributes: [
            "turfId", "name", "description", "sportsAvailable", 
            "rating", "totalReviews", "images", "city", "fullAddress"
          ],
          include: [{
            model: Supplier,
            as: "supplier",
            attributes: ["name", "location"]
          }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Format the response
    return favorites.map(fav => {
      const base = {
        favoriteId: fav.favoriteId,
        entityType: fav.entityType,
        entityId: fav.entityId,
        createdAt: fav.createdAt
      };

      if (fav.entityType === 'academy' && fav.academy) {
        return { ...base, entity: fav.academy };
      } else if (fav.entityType === 'coach' && fav.coach) {
        return { ...base, entity: fav.coach };
      } else if (fav.entityType === 'turf' && fav.turf) {
        return { ...base, entity: fav.turf };
      }
      
      return base;
    }).filter(fav => fav.entity); // Only return favorites where entity still exists
  }

  async isFavorite(userId, entityType, entityId) {
    const favorite = await UserFavorite.findOne({
      where: { userId, entityType, entityId }
    });
    return !!favorite;
  }

  async getFavoriteStats(userId) {
    const stats = await UserFavorite.findAll({
      where: { userId },
      attributes: [
        'entityType',
        [UserFavorite.sequelize.fn('COUNT', UserFavorite.sequelize.col('entityType')), 'count']
      ],
      group: ['entityType'],
      raw: true
    });

    const result = {
      total: 0,
      academies: 0,
      coaches: 0,
      turfs: 0
    };

    stats.forEach(stat => {
      result.total += parseInt(stat.count);
      result[`${stat.entityType}s`] = parseInt(stat.count);
    });

    return result;
  }
}

module.exports = new UserFavoriteRepository();