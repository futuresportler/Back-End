const {
  AcademyProfile,
  AcademyCoach,
  AcademyBatch,
  AcademyStudent,
  AcademyFee,
} = require("../../../database");
const SupplierRepository = require("./supplierRepository");
const { v4: uuidv4 } = require("uuid");
const academyInvitationService = require("../../academy/academyInvitationService");

async function createAcademyProfile(data) {
  const {
    supplierId,
    basic_info,
    sports_details,
    coaches = [],
    batches = [],
    manager_info = {},
    payment_info = {},
  } = data;

  // 1️⃣ Determine managerId
  let managerId;
  let managerInvitationSent = false;

  if (manager_info.owner_is_manager) {
    managerId = null;
  } else if (manager_info.manager) {
    const m = manager_info.manager;
    let mgr = await SupplierRepository.findSupplierByMobile(m.phone);
    if (mgr) {
      managerId = mgr.supplierId;
    } else {
      mgr = await SupplierRepository.createSupplier({
        supplierId: uuidv4(),
        name: m.name,
        email: m.email,
        mobile_number: m.phone,
        role: "manager",
        module: ["academy"],
        isVerified: false,
      });
      managerId = mgr.supplierId;
    }
    managerInvitationSent = true;
  }

  // 2️⃣ Create AcademyProfile
  let location = null;
  if (sports_details?.academy_video?.geolocation) {
    const [latStr, lonStr] = sports_details.academy_video.geolocation
      .split(",")
      .map((s) => s.trim().replace(/[°NSEW]/g, ""));
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    location = { type: "Point", coordinates: [lon, lat] };
  }

  const profileData = {
    supplierId,
    ...(basic_info?.academy_name && { name: basic_info.academy_name }),
    ...(basic_info?.academy_description && {
      description: basic_info.academy_description,
    }),
    ...(basic_info?.year_of_establishment && {
      foundedYear: basic_info.year_of_establishment,
    }),
    ...(managerId !== undefined && { managerId }),
    ...(managerId && {
      managerInvitationStatus: "pending",
      managerInvitedAt: new Date(),
    }),
    ...(basic_info?.city && { city: basic_info.city }),
    ...(basic_info?.full_address && { address: basic_info.full_address }),
    ...(basic_info?.contact_email && { email: basic_info.contact_email }),
    ...(basic_info?.contact_phone && { phone: basic_info.contact_phone }),
    ...(basic_info?.website && { website: basic_info.website }),
    ...(basic_info?.social_media_links && {
      socialMediaLinks: basic_info.social_media_links,
    }),
    ...(location && { location }),
    ...(sports_details?.sports_available && {
      sports: sports_details.sports_available,
    }),
    ...(sports_details?.champions_achievements && {
      achievements: sports_details.champions_achievements,
    }),
    ...(sports_details?.facilities && {
      facilities: sports_details.facilities,
    }),
    ...(sports_details?.age_groups && { ageGroups: sports_details.age_groups }),
    ...(sports_details?.class_types && {
      classTypes: sports_details.class_types,
    }),
    ...(sports_details?.academy_photos && {
      photos: sports_details.academy_photos,
    }),
    ...(sports_details?.academy_video?.url && {
      videos: [sports_details.academy_video.url],
    }),
  };

  const profile = await AcademyProfile.create(profileData);
  const academyId = profile.academyId;

  // 3️⃣ Create AcademyCoach entries
  for (const c of coaches) {
    await AcademyCoach.create({
      id: uuidv4(),
      name: c.coach_name,
      experienceLevel: String(c.years_of_experience),
      role: c.specialization,
      sport: c.specialization.split(" ")[0],
      certifications: c.certifications,
      email: c.email,
      mobileNumber: c.mobileNumber,
      academyId,
      invitationStatus: "pending",
      invitedAt: new Date(),
      invitationToken: uuidv4(),
    });
  }

  // 4️⃣ Create AcademyBatch entries
  for (const b of batches) {
    const [daysPart = "", timePart = ""] = b.timing.split(",");
    const daysOfWeek = [daysPart.trim()];
    const [startTime = "", endTime = ""] = timePart
      .split("-")
      .map((t) => t.trim());

    await AcademyBatch.create({
      batchId: uuidv4(),
      academyId,
      batchName: b.batch_name,
      ageGroup: b.age_group,
      fee: b.monthly_fee,
      daysOfWeek,
      startTime,
      endTime,
      maxStudents: b.capacity,
    });
  }

  // 5️⃣ Update Supplier with payment_info if present
  if (payment_info.gst_number || payment_info.payment_details) {
    const upd = {};
    if (payment_info.gst_number) upd.gstNumber = payment_info.gst_number;
    if (payment_info.payment_details) {
      const pd = payment_info.payment_details;
      upd.bankAccountNumber = pd.bank_account_number;
      upd.accountHolderName = pd.account_holder_name;
      upd.ifscCode = pd.ifsc_code;
      upd.upiId = pd.upi_id;
    }
    await SupplierRepository.updateSupplier(supplierId, upd);
  }

  // 6️⃣ Send Invitations
  if (managerInvitationSent && managerId) {
    try {
      await academyInvitationService.inviteManager(
        academyId,
        supplierId,
        manager_info.manager
      );
    } catch (error) {
      console.error("Failed to send manager invitation:", error);
    }
  }

  for (const c of coaches) {
    if (c.mobileNumber) {
      try {
        await academyInvitationService.inviteCoach(academyId, supplierId, {
          phoneNumber: c.mobileNumber,
          email: c.email,
          name: c.coach_name,
          bio: `${c.specialization} coach with ${c.years_of_experience} years experience`,
          specialization: [c.specialization],
        });
      } catch (error) {
        console.error("Failed to send coach invitation:", error);
      }
    }
  }

  return profile;
}

async function updateAcademyProfile(profileId, updateData) {
  return await AcademyProfile.update(updateData, {
    where: { academyProfileId: profileId },
    returning: true,
  });
}

async function getAcademyProfileBySupplierId(
  supplierId,
  {
    includeBatches = false,
    includePrograms = false,
    includeCoaches = false,
    includeStudents = false,
    includeFees = false,
  } = {}
) {
  const include = [];

  if (includeBatches) {
    include.push({ model: AcademyBatch, as: "AcademyBatche" });
  }
  if (includePrograms) {
    include.push({ model: AcademyProgram, as: "" });
  }
  if (includeCoaches) {
    include.push({ model: AcademyCoach, as: "AcademyCoach" });
  }
  if (includeStudents) {
    include.push({ model: AcademyStudent, as: "AcademyStudents" });
  }
  if (includeFees) {
    include.push({ model: AcademyFee, as: "AcademyFees" });
  }

  return await AcademyProfile.findAll({
    where: { supplierId },
    include,
  });
}

async function deleteAcademyProfile(profileId) {
  return await AcademyProfile.destroy({
    where: { academyProfileId: profileId },
  });
}

module.exports = {
  createAcademyProfile,
  updateAcademyProfile,
  getAcademyProfileBySupplierId,
  deleteAcademyProfile,
};
