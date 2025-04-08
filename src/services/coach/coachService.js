const coachRepository = require("./repositories/coachRepository");
const { SupplierService } = require("../supplier/index");

const createCoachProfile = async (supplierId, profileData) => {
  // Verify supplier exists and has coach module
  const supplier = await SupplierService.getSupplierByModule(
    supplierId,
    "coach"
  );
  if (!supplier) {
    throw new Error("Supplier not found or not configured as coach");
  }

  // Check if profile already exists
  const existingProfile = await coachRepository.findCoachBySupplierId(
    supplierId
  );
  if (existingProfile) {
    throw new Error("Coach profile already exists");
  }

  // Create profile
  return await coachRepository.createCoachProfile({
    ...profileData,
    supplierId,
    coachProfileId: uuidv4(),
  });
};

const getCoachProfile = async (coachProfileId) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId);
  if (!profile) {
    throw new Error("Coach profile not found");
  }
  return profile;
};

const getCoachBySupplier = async (supplierId) => {
  const profile = await coachRepository.findCoachBySupplierId(supplierId);
  if (!profile) {
    throw new Error("No coach profile found for this supplier");
  }
  return profile;
};

const updateCoachProfile = async (coachProfileId, updateData) => {
  const updated = await coachRepository.updateCoachProfile(
    coachProfileId,
    updateData
  );
  if (!updated) {
    throw new Error("Coach profile not found");
  }
  return updated;
};

const deleteCoachProfile = async (coachProfileId) => {
  const deleted = await coachRepository.deleteCoachProfile(coachProfileId);
  if (!deleted) {
    throw new Error("Coach profile not found");
  }

  // Reset supplier module if needed
  await SupplierService.updateSupplierModule(deleted.supplierId, "none");
  return deleted;
};

const getNearbyCoaches = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) {
    throw new Error("Coordinates are required");
  }
  return await coachRepository.findCoachesNearby(latitude, longitude, radius);
};

const addCoachCertification = async (coachProfileId, certificationData) => {
  const profile = await coachRepository.findCoachProfileById(coachProfileId);
  if (!profile) {
    throw new Error("Coach profile not found");
  }

  // Implementation depends on your certification model
  // This is a placeholder implementation
  const updatedCertifications = [
    ...(profile.certificationIds || []),
    certificationData.certificationId,
  ];

  return await coachRepository.updateCoachProfile(coachProfileId, {
    certificationIds: updatedCertifications,
  });
};

module.exports = {
  createCoachProfile,
  getCoachProfile,
  getCoachBySupplier,
  updateCoachProfile,
  deleteCoachProfile,
  getNearbyCoaches,
  addCoachCertification,
};
