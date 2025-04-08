const turfRepository = require("./repositories/turfRepository");
const { SupplierService } = require("../supplier/index");

const createTurfProfile = async (supplierId, profileData) => {
  const supplier = await SupplierService.getSupplierByModule(
    supplierId,
    "turf"
  );
  if (!supplier) {
    throw new Error("Supplier not found or not configured for turf");
  }

  return await turfRepository.createTurfProfile({
    ...profileData,
    supplierId,
    turfProfileId: uuidv4(),
  });
};

const getTurfProfile = async (turfProfileId) => {
  const profile = await turfRepository.findTurfProfileById(turfProfileId);
  if (!profile) throw new Error("Turf profile not found");
  return profile;
};

const getTurfsBySupplier = async (supplierId) => {
  return await turfRepository.findTurfsBySupplierId(supplierId);
};

const updateTurfProfile = async (turfProfileId, updateData) => {
  const updated = await turfRepository.updateTurfProfile(
    turfProfileId,
    updateData
  );
  if (!updated) throw new Error("Turf profile not found");
  return updated;
};

const deleteTurfProfile = async (turfProfileId) => {
  const deleted = await turfRepository.deleteTurfProfile(turfProfileId);
  if (!deleted) throw new Error("Turf profile not found");

  // Check if supplier has other turfs
  const remainingTurfs = await turfRepository.findTurfsBySupplierId(
    deleted.supplierId
  );
  if (remainingTurfs.length === 0) {
    await SupplierService.updateSupplierModule(deleted.supplierId, "none");
  }
  return deleted;
};

const getNearbyTurfs = async (latitude, longitude, radius = 5000) => {
  if (!latitude || !longitude) throw new Error("Coordinates are required");
  return await turfRepository.findTurfsNearby(latitude, longitude, radius);
};

const addTurfImage = async (turfProfileId, imageUrl) => {
  const profile = await turfRepository.findTurfProfileById(turfProfileId);
  if (!profile) throw new Error("Turf profile not found");

  const updatedImages = [...(profile.images || []), imageUrl];

  return await turfRepository.updateTurfProfile(turfProfileId, {
    images: updatedImages,
  });
};

module.exports = {
  createTurfProfile,
  getTurfProfile,
  getTurfsBySupplier,
  updateTurfProfile,
  deleteTurfProfile,
  getNearbyTurfs,
  addTurfImage,
};
