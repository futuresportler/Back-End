const { errorResponse } = require("../../common/utils/response")
const logger = require("../../config/logging")

const errorMiddleware = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`)
  logger.error(err.stack)

  // Default to 500 internal server error
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  errorResponse(res, message, err, statusCode)
}

module.exports = errorMiddleware
