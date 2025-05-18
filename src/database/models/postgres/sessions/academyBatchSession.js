module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const AcademyBatchSession = sequelize.define(
    "academy_batch_session",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      batch_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      academy_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.is_cancelled) return "cancelled";
          if (this.is_completed) return "completed";
          if (this.user_id) return "booked";
          return "available";
        },
        set() {
          throw new Error("Do not try to set the `status` value!");
        },
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_cancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["batch_id"],
        },
        {
          fields: ["academy_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["date"],
        },
      ],
    }
  );

  return AcademyBatchSession;
};
