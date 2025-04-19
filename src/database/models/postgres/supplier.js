// models/postgres/supplier.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Supplier",
    {
      supplierId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
        type: DataTypes.ENUM(
          "owner",
          "employee",
          "reviewer",
          "manager",
          "admin"
        ),
        defaultValue: "owner",
      },
      module: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        validate: {
          isValidModuleArray(value) {
            const allowed = ["coach", "academy", "turf"];
            if (!Array.isArray(value)) {
              throw new Error("Module must be an array.");
            }
            const uniqueValues = new Set(value);
            for (let v of uniqueValues) {
              if (!allowed.includes(v)) {
                throw new Error(
                  "Module must contain only 'coach', 'academy', or 'turf'."
                );
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
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );
};
