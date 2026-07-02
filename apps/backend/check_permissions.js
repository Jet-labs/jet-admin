const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rules = await prisma.casbin_rule.findMany({
    where: {
      v2: { contains: 'dataquery' }
    }
  });
  
  console.log(rules);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
