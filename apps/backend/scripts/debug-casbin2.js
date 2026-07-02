require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ROLE_ID = "d527f3b0-31a7-4a81-b85a-8a1973f56aec";
async function main() {
  const role = await prisma.tblRoles.findUnique({
    where: { roleID: ROLE_ID },
    include: {
      tblRolePermissionMappings: {
        include: { tblPermissions: { select: { permissionTitle: true } } },
      },
    },
  });
  console.log("Role:", role.roleTitle, "| tenantID:", role.tenantID);
  console.log("Permissions (" + role.tblRolePermissionMappings.length + "):");
  role.tblRolePermissionMappings.forEach((p) =>
    console.log("  -", p.tblPermissions.permissionTitle)
  );

  // Also list all available datasource permissions
  const allDsPerms = await prisma.tblPermissions.findMany({
    where: { permissionTitle: { contains: "datasource" } },
    select: { permissionID: true, permissionTitle: true },
  });
  console.log("\nAll datasource-related permissions available:");
  allDsPerms.forEach((p) => console.log(" ", p.permissionID, "|", p.permissionTitle));
}
main().catch(console.error).finally(() => prisma.$disconnect());
