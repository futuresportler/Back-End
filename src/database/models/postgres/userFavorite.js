module.exports = (sequelize, DataTypes) => {
  const UserFavorite = sequelize.define(
    "UserFavorite",
    {
      favoriteId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "userId",
        },
      },
      entityType: {
        type: DataTypes.ENUM('academy', 'coach', 'turf'),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: "ID of the academy, coach, or turf being favorited"
      },
      supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "supplierId",
        },
        comment: "Supplier who owns the entity"
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["userId", "entityType", "entityId"],
          name: "unique_user_entity_favorite"
        },
        {
          fields: ["userId"]
        },
        {
          fields: ["entityType"]
        },
        {
          fields: ["supplierId"]
        }
      ]
    }
  );

  return UserFavorite;
};