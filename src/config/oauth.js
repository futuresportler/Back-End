const auth = require("./firebase");

async function verifyOAuthToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken; // Returns user info
  } catch (error) {
    throw new Error("Invalid OAuth token");
  }
}

module.exports = { verifyOAuthToken };
