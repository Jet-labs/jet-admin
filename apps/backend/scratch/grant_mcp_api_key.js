const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const apiKeyID = "b79c5899-f243-45a7-b3ba-b065427345b3";
  
  const apiKey = await prisma.tblAPIKeys.findUnique({ where: { apiKeyID } });
  if (!apiKey) {
    console.error("API Key not found");
    return;
  }
  
  const adminRole = await prisma.tblRoles.findFirst({
    where: { roleTitle: "ADMIN" }
  });
  
  if (!adminRole) {
    console.log("ADMIN role not found");
    return;
  }
  
  try {
    await prisma.tblAPIKeyRoleMappings.upsert({
      where: { apiKeyID_roleID: { apiKeyID, roleID: adminRole.roleID } },
      update: {},
      create: { apiKeyID, roleID: adminRole.roleID }
    });
    console.log(`Granted role ADMIN to API Key`);
  } catch (err) {
    console.error(`Error granting role ADMIN:`, err.message);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
