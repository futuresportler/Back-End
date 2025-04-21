const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isOAuth: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      firebaseUID: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        defaultValue: "active",
      },
    },
    {
      tableName: "User",
      timestamps: true,
      paranoid: true,
    }
  );

  User.beforeCreate((user) => {
    if (user.latitude && user.longitude) {
      user.location = {
        type: "Point",
        coordinates: [user.longitude, user.latitude],
      };
    }
  });

  User.beforeUpdate((user) => {
    if (user.latitude && user.longitude) {
      user.location = {
        type: "Point",
        coordinates: [user.longitude, user.latitude],
      };
    }
  });

  return User;
};