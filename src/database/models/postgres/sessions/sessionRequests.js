module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  // Academy Batch Session Requests
  const AcademyBatchSessionRequest = sequelize.define(
    "academy_batch_session_request",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["session_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  // Academy Program Session Requests
  const AcademyProgramSessionRequest = sequelize.define(
    "academy_program_session_request",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["session_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  // Coach Session Requests
  const CoachSessionRequest = sequelize.define(
    "coach_session_request",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["session_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  // Turf Session Requests
  const TurfSessionRequest = sequelize.define(
    "turf_session_request",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      session_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ["session_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  return {
    AcademyBatchSessionRequest,
    AcademyProgramSessionRequest,
    CoachSessionRequest,
    TurfSessionRequest,
  };
};
