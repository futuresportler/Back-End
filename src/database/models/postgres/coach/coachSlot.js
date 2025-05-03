// models/postgres/coachSlot.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachSlot",
    {
      slotId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      coachId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoachProfiles",
          key: "coachId",
        },
        onDelete: "CASCADE",
      },
      dayId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Days",
          key: "dayId",
        },
      },
      dayOfWeek: {
        type: DataTypes.INTEGER, // 0-6 for Sunday-Saturday
        allowNull: false,
        validate: {
          min: 0,
          max: 6,
        },
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      status: {
        type: DataTypes.ENUM("available", "booked", "cancelled"),
        defaultValue: "available",
      },
      sessionType: {
        type: DataTypes.ENUM("individual", "group"),
        defaultValue: "individual",
      },
      maxCapacity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      currentBookings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: true,
      },
      locationDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId", "dayOfWeek", "startTime", "endTime"],
          unique: true,
          where: {
            isRecurring: true,
          },
        },
      ],
    },
  )
}
