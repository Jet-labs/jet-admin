const modules = [
  "apiKey",
  "audit",
  "auth",
  "cronJob",
  "dashboard",
  "database",
  "databaseTable",
  "databaseTrigger",
  "dataQuery",
  "datasource",
  "notification",
  "tenant",
  "tenantRole",
  "widget",
  "userManagement",
];

const moduleDependencies = {
    apiKey: ["auth", "tenant"],
    audit: ["auth", "tenant"],
    auth: [],
    cronJob: ["auth", "tenant", "dataQuery"],
    dashboard: ["auth", "tenant", "widget"],
    database: ["auth", "tenant"],
    databaseTable: ["auth", "tenant", "database"],
    databaseTrigger: ["auth", "tenant", "database"],
    dataQuery: ["auth", "tenant", "datasource"],
    datasource: ["auth", "tenant"],
    notification: ["auth", "tenant"],
    tenant: ["auth"],
    tenantRole: ["auth", "tenant"],
    widget: ["auth", "tenant", "dataQuery"],
    userManagement: ["auth", "tenant"],
};

module.exports = { modules, moduleDependencies };
