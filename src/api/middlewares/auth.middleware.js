const { verifyToken, verifyRefresh } = require("../../config/auth")
const { errorResponse } = require("../../common/utils/response")

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" })
    }

    const token = authHeader.split(" ")[1] // Extract token from "Bearer <token>"
    const decoded = verifyToken(token)

    req.user = decoded // Attach decoded user info to `req`
    next()
  } catch (error) {
    errorResponse(res, { message: "Unauthorized: Invalid token" }, error, 401)
  }
}

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" })
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Requires ${roles.join(" or ")} role`,
      })
    }

    next()
  }
}

const refreshMiddleWare = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" })
    }

    const token = authHeader.split(" ")[1] // Extract token from "Bearer <token>"
    const decoded = verifyRefresh(token)

    req.user = decoded // Attach decoded user info to `req`
    next()
  } catch (error) {
    errorResponse(res, { message: "Unauthorized: Invalid token" }, error, 401)
  }
}

// For backward compatibility
const authMiddleware = authenticate

module.exports = {
  authenticate,
  authorize,
  refreshMiddleWare,
  // For backward compatibility
  authMiddleware,
}
