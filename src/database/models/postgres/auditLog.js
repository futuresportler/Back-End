const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
    return sequelize.define("AuditLog", {
      logId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      workerEmail: DataTypes.STRING,
      serviceType: DataTypes.ENUM("academy", "turf", "coach"),
      serviceId: DataTypes.UUID,
      serviceName: DataTypes.STRING,
      action: {
        type: DataTypes.ENUM("delete"),
        defaultValue: "delete",
      },
      reason: DataTypes.STRING,
    }, {
      timestamps: true,
      paranoid: false,
    });
  };