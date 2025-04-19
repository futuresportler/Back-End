// models/postgres/turfGround.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TurfGround",
    {
      groundId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      groundName: DataTypes.STRING,
      surfaceType: {
        type: DataTypes.ENUM("natural", "artificial", "hybrid"),
        defaultValue: "artificial",
      },
      capacity: DataTypes.INTEGER,
      hourlyRate: DataTypes.DECIMAL(10,2),
    },
    { timestamps: true }
  );
};