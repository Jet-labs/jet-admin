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
  console.log("Starting args to inputs migration phase 2...");

  // 1. tblAppPages
  const pages = await prisma.tblAppPages.findMany();
  for (const p of pages) {
    if (p.appPageConfig) {
      const newConfig = recursiveReplaceArgs(p.appPageConfig, false);
      await prisma.tblAppPages.update({
        where: { appPageID: p.appPageID },
        data: { appPageConfig: newConfig },
      });
    }
  }
  console.log(`Migrated ${pages.length} app pages.`);

  // 2. tblWidgets
  const widgets = await prisma.tblWidgets.findMany();
  for (const w of widgets) {
    if (w.widgetConfig) {
      const newConfig = recursiveReplaceArgs(w.widgetConfig, true);
      await prisma.tblWidgets.update({
        where: { widgetID: w.widgetID },
        data: { widgetConfig: newConfig },
      });
    }
  }
  console.log(`Migrated ${widgets.length} widgets.`);

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
