// models/postgres/coach/coachBatch.js
const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  return sequelize.define(
    "CoachBatch",
    {
      batchId: {
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
      batchName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ageGroup: {
        type: DataTypes.JSON,
        defaultValue: {
          minAge: 5,
          maxAge: 18,
        },
      },
      classType: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced", "professional"),
        defaultValue: "beginner",
      },
      daysOfWeek: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of integers (0-6) representing days of the week
        allowNull: false,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.GEOMETRY("POINT"),
        allowNull: true,
      },
      maxStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
      },
      currentStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      feeType: {
        type: DataTypes.ENUM("monthly", "hourly", "session"),
        defaultValue: "monthly",
      },
      feeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "full"),
        defaultValue: "active",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      curriculum: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["coachId"],
        },
        {
          fields: ["status"],
        },
      ],
    },
  )
}
