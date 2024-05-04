const { PrismaClient, Prisma } = require("@prisma/client");
// const vehicleSocketController = require("../modules/socket/controllers/machine.socket.controller");
const Logger = require("../utils/logger");
const prisma = new PrismaClient();

const models = Prisma.dmmf.datamodel.models;

const prismaActions = [
  "findUnique",
  "findMany",
  "findFirst",
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "executeRaw",
  "queryRaw",
  "aggregate",
  "count",
  "runCommandRaw",
];

const prismaActionsForCUD = [
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
  "executeRaw",
];
prisma.$use(async (params, next) => {
  const result = await next(params);
  if (
    (params.model === "tbl_machines" ||
      (params.args?.data && params.args.data.tbl_vehicles)) &&
    prismaActionsForCUD.includes(params.action)
  ) {
    Logger.log("info", {
      message: "prisma:use",
      params: { args: params.args, data: params.args?.data },
    });
    // TODO : broadcast machine updates to user based on station mapping
    // vehicleSocketController.broadcastAllVehicles({ prisma });
  }
  return result;
});

module.exports = { prisma, dbModel: models };
