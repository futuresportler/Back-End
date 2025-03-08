const jwt = require("jsonwebtoken");

const generateTokens = (user) => {
  const payload = { userId: user.user_id, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateTokens, verifyToken, verifyRefreshToken };
