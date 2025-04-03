// models/postgres/supplier.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const Supplier = sequelize.define("Supplier", {
  supplierId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // For OAuth users
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isOAuth: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  firebaseUID: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('owner', 'employee', 'reviewer', 'manager', 'admin'),
    defaultValue: 'owner'
  },
  module: {
    type: DataTypes.ENUM('coach', 'academy', 'turf', 'none'),
    defaultValue: 'none'
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = Supplier;