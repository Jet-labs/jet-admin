/**
 * App-page reference validation.
 *
 * dataSources are stored inside appPageConfig (JSON) and therefore have no
 * foreign keys. Validate their target IDs at save time so a page cannot be
 * saved pointing at another tenant's query/workflow/listener.
 */

const { assertTenantReferences } = require("../../utils/tenantReference.util");

async function validateAppPageReferences({ tenantID, appPageConfig }) {
  if (!appPageConfig || typeof appPageConfig !== "object") return;

  const dataSources = Array.isArray(appPageConfig.dataSources)
    ? appPageConfig.dataSources
    : [];

  const dataQueryIDs = [];
  const workflowIDs = [];
  const listenerIDs = [];

  for (const source of dataSources) {
    if (!source || typeof source !== "object") continue;

    const type = source.type;
    if (!type) {
      const error = new Error(
        "Each app-page data source must declare type ('query', 'workflow', or 'listener')"
      );
      error.statusCode = 400;
      error.code = "APP_PAGE_DATASOURCE_TYPE_REQUIRED";
      throw error;
    }
    if (!["query", "workflow", "listener"].includes(type)) {
      const error = new Error(`Unsupported app-page data source type '${type}'`);
      error.statusCode = 400;
      error.code = "APP_PAGE_DATASOURCE_TYPE_INVALID";
      throw error;
    }

    if (type === "query" && source.queryID) {
      dataQueryIDs.push(source.queryID);
    } else if (type === "workflow" && source.workflowID) {
      workflowIDs.push(source.workflowID);
    } else if (type === "listener" && source.listenerID) {
      listenerIDs.push(source.listenerID);
    } else {
      const error = new Error(`App-page ${type} data source is missing its ${type}ID`);
      error.statusCode = 400;
      error.code = "APP_PAGE_DATASOURCE_TARGET_REQUIRED";
      throw error;
    }
  }

  await assertTenantReferences({ tenantID, dataQueryIDs, workflowIDs, listenerIDs });
}

module.exports = { validateAppPageReferences };
