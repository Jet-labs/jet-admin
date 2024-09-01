const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const models = Prisma.dmmf.datamodel.models;



module.exports = { prisma, dbModel: models };
