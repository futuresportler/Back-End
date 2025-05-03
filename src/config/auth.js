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

const generateSupplierTokens = (supplier) => {
  const payload = { supplierId: supplier.supplierId, mobile_number: supplier.mobile_number };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const generateCoachTokens = (coach) => {
  const payload = { coachId: coach.coachId, mobile_number: coach.mobile_number };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const generateAcademyTokens = (academy) => {
  const payload = { academyId: academy.academyId, mobile_number: academy.mobile_number };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};

const generateTurfTokens = (turf) => {
  const payload = { turfId: turf.turfId, mobile_number: turf.mobile_number };

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
  generateSupplierTokens,
  generateCoachTokens,
  generateAcademyTokens,
  generateTurfTokens,
  verifyToken,
  verifyRefresh,
};
