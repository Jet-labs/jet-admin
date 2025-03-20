const { prisma } = require("../config/prisma.config");
const Logger = require("./logger");

const globalUtil = {};
globalUtil.seedTenantData = async () => {
  try {
    const tenants = await prisma.tblTenants.findMany();
    const tenantsToDBURLMap = {};
    for (let i = 0; i < tenants.length; i++) {
      tenantsToDBURLMap[tenants[i].tenantID] = tenants[i].tenantDBURL;
    }
    global.tenantsToDBURLMap = tenantsToDBURLMap;
    Logger.log("success", {
      message: "globalUtil:seedTenantData:tenantsToDBURLMap",
      params: { tenantsToDBURLMap },
    });
  } catch (error) {
    Logger.log("error", {
      message: "globalUtil:seedTenantData:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { globalUtil };
