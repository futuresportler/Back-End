const jwt = require("jsonwebtoken");

const generateTokens = (user) => {
  const payload = { userId: user.userId, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const generateCoachTokens = (coach) => {
  const payload = { coachId: coach.coachId, email: coach.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const generateAcademyTokens = (academy) => {
  const payload = { academyId: academy.academyId, email: academy.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefresh = (token) => jwt.verify(token, process.env.REFRESH_SECRET);

module.exports = {
  generateTokens,
  generateCoachTokens,
  generateAcademyTokens,
  verifyToken,
  verifyRefresh,
};
