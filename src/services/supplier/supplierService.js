const { hashPassword, comparePassword } = require("../../common/utils/hash");
const { generateTokens } = require("../../config/auth");
const { v4: uuidv4 } = require("uuid");
const SupplierRepository = require("./repositories/supplierRepository");

async function signUp(supplierData) {
  const { email, password, ...rest } = supplierData;

  // Check if supplier exists
  const existingSupplier = await SupplierRepository.findSupplierByEmail(email);
  if (existingSupplier) {
    throw new Error("Supplier already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create supplier
  const newSupplier = await SupplierRepository.createSupplier({
    ...rest,
    email,
    password: hashedPassword,
    supplierId: uuidv4(),
  });

  // Generate tokens
  const tokens = generateTokens(newSupplier);

  return { supplier: newSupplier, tokens };
}

async function signIn(email, password) {
  const supplier = await SupplierRepository.findSupplierByEmail(email);
  if (!supplier) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, supplier.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return generateTokens(supplier);
}

async function getSupplierProfile(supplierId) {
  return await SupplierRepository.findSupplierById(supplierId);
}

async function updateSupplierModule(supplierId, module) {
  if (!["coach", "academy", "turf", "none"].includes(module)) {
    throw new Error("Invalid module specified");
  }
  return await SupplierRepository.setSupplierModule(supplierId, module);
}

async function refreshToken(supplierId) {
  const supplier = await SupplierRepository.findSupplierById(supplierId);
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return generateTokens(supplier);
}

async function requestOTP(email) {
  const supplier = await SupplierRepository.findSupplierByEmail(email);
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  // Implement your OTP logic here
  return { message: "OTP sent successfully" };
}

async function updateSupplierProfile(supplierId, updateData) {
  return await SupplierRepository.updateSupplier(supplierId, updateData);
}

async function getSupplierByModule(supplierId, module) {
  return await SupplierRepository.getSupplierWithProfile(supplierId, module);
}

module.exports = {
  signUp,
  signIn,
  getSupplierProfile,
  updateSupplierModule,
  refreshToken,
  requestOTP,
  updateSupplierProfile,
  getSupplierByModule,
};
