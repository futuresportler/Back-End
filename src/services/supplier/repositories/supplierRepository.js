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

async function setSupplierModule(supplierId, module) {
  return await updateSupplier(supplierId, { module });
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
  updateSupplier,
  deleteSupplier,
  setSupplierModule,
  getSupplierWithProfile,
};
