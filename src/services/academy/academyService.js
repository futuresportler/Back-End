const academyRepository = require("./repositories/academyRepository");
const { SupplierService } = require("../supplier/index");

const createAcademyProfile = async (supplierId, profileData) => {
  const supplier = await SupplierService.getSupplierByModule(
    supplierId,
    "academy"
  );
  if (!supplier) {
    throw new Error("Supplier not found or not configured for academy");
  }

  return await academyRepository.createAcademyProfile({
    ...profileData,
    supplierId,
    academyProfileId: uuidv4(),
  });
};

const getAcademyProfile = async (academyProfileId) => {
  const profile = await academyRepository.findAcademyProfileById(
    academyProfileId
  );
  if (!profile) throw new Error("Academy profile not found");
  return profile;
};

const getAcademiesBySupplier = async (supplierId) => {
  return await academyRepository.findAcademiesBySupplierId(supplierId);
};

const updateAcademyProfile = async (academyProfileId, updateData) => {
  const updated = await academyRepository.updateAcademyProfile(
    academyProfileId,
    updateData
  );
  if (!updated) throw new Error("Academy profile not found");
  return updated;
};

const deleteAcademyProfile = async (academyProfileId) => {
  const deleted = await academyRepository.deleteAcademyProfile(
    academyProfileId
  );
  if (!deleted) throw new Error("Academy profile not found");

  // Check if supplier has other academies
  const remainingAcademies = await academyRepository.findAcademiesBySupplierId(
    deleted.supplierId
  );
  if (remainingAcademies.length === 0) {
    await SupplierService.updateSupplierModule(deleted.supplierId, "none");
  }
  return deleted;
};

const getNearbyAcademies = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) throw new Error("Coordinates are required");
  return await academyRepository.findAcademiesNearby(
    latitude,
    longitude,
    radius
  );
};

const forgotPassword = async (email) => {
  const academy = await getAcademyByEmail(email);
  if (!academy) {
    const error = new Error("academy not found");
    error.statusCode = 404;
    throw error;
  }
  const otp = generateOTP();
  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);
  return { message: "OTP sent successfully!" };
};

const forgotPasswordOTPVerify = async (email, otp) => {
  const isValid = await verifyOTP(email, otp);
  if (!isValid) throw new Error("Invalid or expired OTP");

  const academy = await getAcademyByEmail(email);
  if (!academy) {
    const error = new Error("academy not found");
    error.statusCode = 404;
    throw error;
  }

  await updateAcademy(academy.academyId, { isVerified: true });
  const tokens = generateAcademyTokens(academy);
  return { tokens };
};

const resetPassword = async (academyId, password) => {
  const hashedPassword = await hashPassword(password);
  await updateAcademy(academyId, { password: hashedPassword });
  return { message: "Password reset successfully!" };
};

module.exports = {
  createAcademyProfile,
  getAcademyProfile,
  getAcademiesBySupplier,
  updateAcademyProfile,
  deleteAcademyProfile,
  getNearbyAcademies,
  addAcademySport,
};
