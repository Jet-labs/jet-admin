import { prisma } from "../../config/prisma.config.js";

const t = await prisma.tblDataQueries.findMany({
  where: {
    NOT: {
        OR: [
        { tblDatasources: { is: null } },
        { tblDatasources: { is: undefined } },
      ],
    
    },
  },
  include: {
    tblDatasources: true,
  },
});

console.log(JSON.stringify(t, null, 2));
