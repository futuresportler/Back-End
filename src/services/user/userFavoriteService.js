const userFavoriteRepository = require("./repositories/userFavoriteRepository");
const { AcademyProfile, CoachProfile, TurfProfile } = require("../../database");

class UserFavoriteService {

  async addToFavorites(userId, entityType, entityId) {
    // Validate entity type
    if (!['academy', 'coach', 'turf'].includes(entityType)) {
      throw new Error("Invalid entity type. Must be 'academy', 'coach', or 'turf'");
    }

    // Get supplier ID based on entity type and ID
    const supplierId = await this._getSupplierId(entityType, entityId);
    
    if (!supplierId) {
      throw new Error(`${entityType} not found`);
    }

    return await userFavoriteRepository.addFavorite(userId, entityType, entityId, supplierId);
  }

  async removeFromFavorites(userId, entityType, entityId) {
    return await userFavoriteRepository.removeFavorite(userId, entityType, entityId);
  }

  async getUserFavorites(userId, entityType = null) {
    return await userFavoriteRepository.getUserFavorites(userId, entityType);
  }

  async checkIsFavorite(userId, entityType, entityId) {
    return await userFavoriteRepository.isFavorite(userId, entityType, entityId);
  }

  async getFavoriteStats(userId) {
    return await userFavoriteRepository.getFavoriteStats(userId);
  }

  async _getSupplierId(entityType, entityId) {
    let entity;
    
    switch (entityType) {
      case 'academy':
        entity = await AcademyProfile.findByPk(entityId, {
          attributes: ['supplierId']
        });
        break;
      case 'coach':
        entity = await CoachProfile.findByPk(entityId, {
          attributes: ['supplierId']
        });
        break;
      case 'turf':
        entity = await TurfProfile.findByPk(entityId, {
          attributes: ['supplierId']
        });
        break;
      default:
        return null;
    }

    return entity ? entity.supplierId : null;
  }
}

module.exports = new UserFavoriteService();