const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing existing database inputs in tblWorkflowNodes...");
  const nodes = await prisma.tblWorkflowNodes.findMany();
  let updatedCount = 0;

  for (const n of nodes) {
    if (n.nodeConfig && n.nodeConfig.inputDefinitions && !Array.isArray(n.nodeConfig.inputDefinitions)) {
      const newConfig = { ...n.nodeConfig };
      newConfig.inputValues = newConfig.inputDefinitions;
      delete newConfig.inputDefinitions;

      await prisma.tblWorkflowNodes.update({
        where: { nodeID: n.nodeID },
        data: { nodeConfig: newConfig },
      });
      updatedCount++;
    }
  }

  console.log(`Successfully fixed ${updatedCount} workflow nodes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
