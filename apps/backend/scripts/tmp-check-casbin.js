const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.casbin_rule
  .findMany({ where: { v2: { contains: "testmanual" } } })
  .then((rules) => {
    console.log("casbin_rule rows for testmanual:", rules.length);
    for (const r of rules) {
      console.log(`  ${r.ptype} | ${r.v0} | ${r.v1} | ${r.v2} | ${r.v3}`);
    }
  })
  .catch((e) => console.error("ERR", e.message))
  .finally(() => prisma.$disconnect());
