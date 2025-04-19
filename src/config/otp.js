const auth = require("./firebase"); // Import Firebase Auth
const {setCache, getCache, delCache} = require("./cache");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = async (email, otp) => {
  await setCache(`otp:${email}`, otp, 300); // OTP expires in 5 minutes
};

const verifyOTP = async (email, otp) => {
  const storedOTP = await getCache(`otp:${email}`);
  if (!storedOTP) return false;
  await delCache(`otp:${email}`); // Delete OTP after verification
  return storedOTP === otp;
};


async function verifyAndExtractUser(idToken) {
  try {
    const decodedUser = await auth.verifyIdToken(idToken);
    return {
      mobileNumber: decodedUser.phone_number || null,
    };
  } catch (error) {
    console.error("Firebase Token Verification Failed:", error.message);
    throw new Error("Invalid Firebase ID token");
  }
}

module.exports = { verifyAndExtractUser, generateOTP, storeOTP, verifyOTP };
