const environment = require("../environment");
const { dbModel } = require("../config/prisma");
const Logger = require("../utils/logger");
const fs = require("fs");
const map = {};

const createSuperAdminPolicy = () => {
  try {
    Logger.log("info", {
      message: "createSuperAdminPolicy:starting...",
    });
    const policy = {
      actions: {},
      tables: {
        tbl_pm_policy_objects: true,
        tbl_pm_users: true,
      },
    };
    const name_array = dbModel.map((t) => t.name);
    name_array.forEach((t) => {
      policy.tables[t] = true;
    });
    Logger.log("success", {
      message: "createSuperAdminPolicy:policy created",
      params: { policy },
    });
    return policy;
  } catch (error) {
    Logger.log("error", {
      message: "createSuperAdminPolicy:catch-1",
      params: { error },
    });
  }
};

const createTableToIDMap = () => {
  try {
    Logger.log("info", {
      message: "createTableToIDMap:starting...",
    });
    const map = {};
    dbModel.forEach((t) => {
      t.fields.forEach((f) => {
        if (f.isId) {
          map[t.name] = f.name;
        }
      });
    });
    Logger.log("success", {
      message: "createTableToIDMap:map created",
      params: { map },
    });
    return map;
  } catch (error) {
    Logger.log("error", {
      message: "createTableToIDMap:catch-1",
      params: { error },
    });
  }
};

const main = () => {
  try {
    Logger.log("info", {
      message: "setup:main:starting...",
    });
    const tableIDMap = createTableToIDMap();
    const superAdminPolicy = createSuperAdminPolicy();

    const setupObj = {
      table_id_map: tableIDMap,
      super_admin_policy: superAdminPolicy,
    };
    fs.writeFileSync("setup-config.json", JSON.stringify(setupObj), {
      encoding: "utf8",
      flag: "w",
    });
    Logger.log("success", {
      message: "setup:main:completed",
      params: { map },
    });
  } catch (error) {
    Logger.log("error", {
      message: "setup:main:catch-1",
      params: { error },
    });
  }
};

main();
module.exports = { createTableToIDMap, createSuperAdminPolicy };
