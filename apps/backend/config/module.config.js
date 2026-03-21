const constants = require("../constants");
const environmentVariables = require("../environment");

const moduleDependencies = {
  apiKey: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  audit: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  auth: [],
  cronJob: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATAQUERY,
  ],
  dashboard: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.WIDGET,
  ],
  database: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  databaseTable: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATABASE,
  ],
  databaseTrigger: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATABASE,
  ],
  dataQuery: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATASOURCE,
  ],
  datasource: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  notification: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  tenant: [constants.MODULES.AUTH],
  tenantRole: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  widget: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATAQUERY,
  ],
  userManagement: [constants.MODULES.AUTH, constants.MODULES.TENANT],
  workflow: [constants.MODULES.AUTH, constants.MODULES.TENANT, constants.MODULES.DATAQUERY],
  ai: [
    constants.MODULES.AUTH,
    constants.MODULES.TENANT,
    constants.MODULES.DATAQUERY,
    constants.MODULES.DATASOURCE,
    constants.MODULES.WORKFLOW,
    constants.MODULES.WIDGET,
  ],
};

const isModuleEnabled = (moduleName) => {
  if (
    !environmentVariables.ENABLED_MODULES ||
    !Array.isArray(environmentVariables.ENABLED_MODULES)
  ) {
    return true; // If not configured, enable all modules
  }

  if (!environmentVariables.ENABLED_MODULES.includes(moduleName)) {
    return false;
  }

  // Check if all dependencies are also enabled
  const dependencies = moduleDependencies[moduleName] || [];
  return dependencies.every((dep) =>
    environmentVariables.ENABLED_MODULES.includes(dep)
  );
};

module.exports = { moduleDependencies, isModuleEnabled };
