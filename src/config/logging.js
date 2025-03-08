const pino = require("pino");

// Create Pino logger with both console and file transports
const logger = pino(
  {
    level: "info", // Default log level
    transport: {
      targets: [
        {
          target: "pino-pretty", // Pretty print for console
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
          level: "info",
        },
      ],
    },
  }
);

// Export different log levels
module.exports = {
  logger,
  info: (msg) => logger.info(msg),
  error: (msg) => logger.error(msg),
  warn: (msg) => logger.warn(msg),
  debug: (msg) => logger.debug(msg),
  fatal: (msg) => logger.fatal(msg),
  trace: (msg) => logger.trace(msg),
};
