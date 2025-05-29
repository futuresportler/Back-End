// models/postgres/supplier.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "Supplier",
    {
      supplierId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // New fields
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      idType: {
        type: DataTypes.ENUM("aadhar", "pan", "voter", "driving", "passport"),
        allowNull: true,
      },
      idNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      idImageLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
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
      role: {
        type: DataTypes.ENUM("owner", "employee", "reviewer", "manager", "admin"),
        defaultValue: "owner",
      },
      module: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        validate: {
          isValidModuleArray(value) {
            const allowed = ["coach", "academy", "turf"]
            if (!Array.isArray(value)) {
              throw new Error("Module must be an array.")
            }
            const uniqueValues = new Set(value)
            for (const v of uniqueValues) {
              if (!allowed.includes(v)) {
                throw new Error("Module must contain only 'coach', 'academy', or 'turf'.")
              }
            }
          },
        },
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "suspended"),
        defaultValue: "active",
      },
      gstNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ifscCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      upiId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  )
}
