const {
  Supplier,
  CoachProfile,
  AcademyProfile,
  TurfProfile,
} = require("../../../database");

async function createSupplier(supplierData) {
  return await Supplier.create(supplierData);
}

async function findSupplierById(supplierId) {
  return await Supplier.findByPk(supplierId, {
    include: [
      { model: CoachProfile, as: "coachProfile" },
      { model: AcademyProfile, as: "academyProfiles" },
      { model: TurfProfile, as: "turfProfiles" },
    ],
  });
}

async function findSupplierByEmail(email) {
  return await Supplier.findOne({
    where: { email },
    include: ["coachProfile", "academyProfiles", "turfProfiles"],
  });
}

async function findSupplierByMobile(mobile_number) {
  return await Supplier.findOne({
    where: { mobile_number },
    include: ["coachProfile", "academyProfiles", "turfProfiles"],
  });
}

async function updateSupplier(supplierId, updateData) {
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) return null;
  return await supplier.update(updateData);
}

async function deleteSupplier(supplierId) {
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) return null;
  await supplier.destroy();
  return supplier;
}

// Add this to supplierRepository.js
async function setSupplierModule(supplierId, module) {
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) throw new Error("Supplier not found");

  // Get current modules array or empty array if null
  const currentModules = supplier.module || [];
  
  // Add module if not already present
  if (!currentModules.includes(module)) {
    currentModules.push(module);
    return await supplier.update({ module: currentModules });
  }

  return supplier; // Return unchanged if module already exists
}

async function getSupplierWithProfile(supplierId, module) {
  const include = [];
  if (module === "coach")
    include.push({ model: CoachProfile, as: "coachProfile" });
  if (module === "academy")
    include.push({ model: AcademyProfile, as: "academyProfiles" });
  if (module === "turf")
    include.push({ model: TurfProfile, as: "turfProfiles" });

  return await Supplier.findByPk(supplierId, { include });
}

module.exports = {
  createSupplier,
  findSupplierById,
  findSupplierByEmail,
  findSupplierByMobile,
  updateSupplier,
  deleteSupplier,
  setSupplierModule,
  getSupplierWithProfile,
};