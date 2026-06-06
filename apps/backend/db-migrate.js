const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDB() {
  console.log('Migrating workflows...');
  const workflows = await prisma.tblWorkflows.findMany();
  for (const wf of workflows) {
    let updated = false;
    const newOptions = { ...wf.workflowOptions };
    
    if (newOptions && newOptions.args !== undefined) {
      newOptions.inputDefinitions = newOptions.args;
      delete newOptions.args;
      updated = true;
    }

    if (newOptions && Array.isArray(newOptions.nodes)) {
      newOptions.nodes = newOptions.nodes.map(node => {
        if (node.type === 'dataQuery' && node.data && node.data.args !== undefined) {
          node.data.inputValues = node.data.args;
          delete node.data.args;
          updated = true;
        }
        return node;
      });
    }

    if (updated) {
      await prisma.tblWorkflows.update({
        where: { workflowID: wf.workflowID },
        data: { workflowOptions: newOptions }
      });
      console.log(`Updated workflow ${wf.workflowID}`);
    }
  }

  console.log('Migrating data queries...');
  const queries = await prisma.tblDataQueries.findMany();
  for (const q of queries) {
    if (q.dataQueryOptions && q.dataQueryOptions.args !== undefined) {
      const newOptions = { ...q.dataQueryOptions };
      newOptions.inputDefinitions = newOptions.args;
      delete newOptions.args;
      await prisma.tblDataQueries.update({
        where: { dataQueryID: q.dataQueryID },
        data: { dataQueryOptions: newOptions }
      });
      console.log(`Updated data query ${q.dataQueryID}`);
    }
  }

  console.log('Migrating app pages...');
  const appPages = await prisma.tblAppPages.findMany();
  for (const page of appPages) {
    if (page.pageOptions && Array.isArray(page.pageOptions.dataSources)) {
      let updated = false;
      const newOptions = { ...page.pageOptions };
      newOptions.dataSources = newOptions.dataSources.map(ds => {
        if (ds.args !== undefined) {
          ds.inputValues = ds.args;
          delete ds.args;
          updated = true;
        }
        return ds;
      });
      if (updated) {
        await prisma.tblAppPages.update({
          where: { pageID: page.pageID },
          data: { pageOptions: newOptions }
        });
        console.log(`Updated app page ${page.pageID}`);
      }
    }
  }

  console.log('Database migration complete.');
  await prisma.$disconnect();
}

migrateDB().catch(console.error);
