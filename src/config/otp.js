const auth = require("./firebase"); // Import Firebase Auth
const redis = require("redis");

const redisClient = redis.createClient();
redisClient.connect();


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = async (email, otp) => {
  await redisClient.setEx(`otp:${email}`, 300, otp); // OTP expires in 5 minutes
};

const verifyOTP = async (email, otp) => {
  const storedOTP = await redisClient.get(`otp:${email}`);
  if (!storedOTP) return false;
  return storedOTP === otp;
};


async function verifyAndExtractUser(idToken) {
  try {
    // const decodedToken = await auth.verifyIdToken(idToken);
    const decodedUser = {
      phone_number: "+911231231111",
    };
    return {
      mobileNumber: decodedUser.phone_number || null,
    };
  } catch (error) {
    console.error("Firebase Token Verification Failed:", error.message);
    throw new Error("Invalid Firebase ID token");
  }
}

module.exports = { verifyAndExtractUser, generateOTP, storeOTP, verifyOTP };
