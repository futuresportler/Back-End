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
      notifications: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      notificationPreferences: {
        type: DataTypes.JSON,
        defaultValue: {
          email: true,
          push: true,
          whatsapp: false,
          sms: false,
          feedbackReminders: true,
          bookingUpdates: true,
        },
      },
      unreadNotificationCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      role: {
        type: DataTypes.ENUM("user", "student", "admin"),
        defaultValue: "user",
        allowNull: false,
      },
      // Add score tracking for users enrolled in coach programs
      currentScores: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Current scores for users enrolled in coach programs",
        // Structure: {
        //   "football": {
        //     overall: 8.2,
        //     lastUpdated: "2024-01-31",
        //     breakdown: {
        //       technique: 8.5,
        //       fitness: 7.0,
        //       teamwork: 9.0
        //     }
        //   }
        // }
      },
      achievementFlags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
        comment: "Achievement flags for coach program students",
      },
      scoreHistory: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: false,
        comment: "Score progression history for coach program students",
      },
    },
    {
      freezeTableName: true, // 🚨 This is the magic sauce
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
