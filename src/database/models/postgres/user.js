const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/database"); // Ensure correct path

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["active", "inactive", "banned"],
      defaultValue: "active",
    },
  },
  {
    tableName: "User",
    timestamps: true,
  }
);

module.exports = User;
