const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function recursiveReplaceArgs(obj, isValueContext = false) {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{\s*args\./g, '{{inputs.');
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => recursiveReplaceArgs(item, isValueContext));
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      let newKey = key;
      // Rename schema definitions vs execution values
      if (key === 'args' || key === 'argDefinitions') {
        newKey = isValueContext ? 'inputValues' : 'inputDefinitions';
      }
      if (key === 'argMapping') {
        newKey = 'inputMapping';
      }
      if (key === 'executionArgs' || key === 'runtimeArgs' || key === 'node.args' || key === 'mappedArgsToValues' || key === 'inputArgs') {
        newKey = 'inputValues';
      }
      
      newObj[newKey] = recursiveReplaceArgs(obj[key], isValueContext);
    }
    return newObj;
  }
  return obj;
}

async function main() {
  console.log("Starting args to inputs migration...");

  // 1. tblDataQueries
  const queries = await prisma.tblDataQueries.findMany();
  for (const q of queries) {
    if (q.dataQueryOptions) {
      const newOptions = recursiveReplaceArgs(q.dataQueryOptions, false);
      await prisma.tblDataQueries.update({
        where: { dataQueryID: q.dataQueryID },
        data: { dataQueryOptions: newOptions },
      });
    }
  }
  console.log(`Migrated ${queries.length} queries.`);

  // 2. tblWorkflows
  const workflows = await prisma.tblWorkflows.findMany();
  for (const w of workflows) {
    if (w.workflowOptions) {
      const newOptions = recursiveReplaceArgs(w.workflowOptions, false);
      await prisma.tblWorkflows.update({
        where: { workflowID: w.workflowID },
        data: { workflowOptions: newOptions },
      });
    }
  }
  console.log(`Migrated ${workflows.length} workflows.`);

  // 3. tblWorkflowNodes
  const nodes = await prisma.tblWorkflowNodes.findMany();
  for (const n of nodes) {
    if (n.nodeConfig) {
      const newConfig = recursiveReplaceArgs(n.nodeConfig, true);
      await prisma.tblWorkflowNodes.update({
        where: { nodeID: n.nodeID },
        data: { nodeConfig: newConfig },
      });
    }
  }
  console.log(`Migrated ${nodes.length} workflow nodes.`);

  // 4. tblListenerActions
  const actions = await prisma.tblListenerActions.findMany();
  for (const a of actions) {
    if (a.actionConfig) {
      const newConfig = recursiveReplaceArgs(a.actionConfig, true);
      await prisma.tblListenerActions.update({
        where: { actionID: a.actionID },
        data: { actionConfig: newConfig },
      });
    }
  }
  console.log(`Migrated ${actions.length} listener actions.`);

  console.log("Migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
