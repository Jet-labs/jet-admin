const { prisma } = require("../config/prisma.config");
const { PERMISSIONS_LIST } = require("../config/permissions");

async function run() {
  console.log("🔍 Verifying permissions from single-source-of-truth against DB...");

  // Fetch existing permissions from the database
  const dbPermissions = await prisma.tblPermissions.findMany();
  const existingPermissionTitles = new Set(
    dbPermissions.map((p) => p.permissionTitle.toLowerCase())
  );

  console.log(`\nFound ${dbPermissions.length} existing permissions in the database.`);

  const missingPermissions = PERMISSIONS_LIST.filter(
    (p) => !existingPermissionTitles.has(p.permissionTitle.toLowerCase())
  );

  if (missingPermissions.length === 0) {
    console.log("\n✅ All permissions are synced. No missing permissions detected in the database.");
    return;
  }

  console.log(`\n⚠️ Found ${missingPermissions.length} missing permissions to seed:`);
  console.log(missingPermissions.map(p => p.permissionTitle));

  // Start Transaction to Seed Missing Permissions and Map to ADMIN
  await prisma.$transaction(async (tx) => {
    // 1. Seed missing permissions
    await tx.tblPermissions.createMany({
      data: missingPermissions,
      skipDuplicates: true,
    });
    console.log("Inserted missing permissions.");

    // Fetch all permissions to get IDs for mapping
    const allPermissions = await tx.tblPermissions.findMany();
    const permissionTitleToId = {};
    allPermissions.forEach((p) => {
      permissionTitleToId[p.permissionTitle.toLowerCase()] = p.permissionID;
    });

    // 2. Fetch the ADMIN role
    const adminRole = await tx.tblRoles.findFirst({
      where: { roleTitle: "ADMIN" },
    });

    if (!adminRole) {
      console.warn("⚠️ ADMIN role not found. Skipping mapping to ADMIN role.");
      return;
    }

    // 3. Prepare role-permission mapping for missing permissions to ADMIN
    const rolePermissionData = missingPermissions.map((p) => ({
      roleID: adminRole.roleID,
      permissionID: permissionTitleToId[p.permissionTitle.toLowerCase()],
    }));

    await tx.tblRolePermissionMappings.createMany({
      data: rolePermissionData,
      skipDuplicates: true,
    });
    console.log(`Mapped ${rolePermissionData.length} new permissions to the 'ADMIN' role.`);
  });

  console.log("\n🎉 Sync completed successfully!");
}

run()
  .catch((err) => {
    console.error("Error running script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
