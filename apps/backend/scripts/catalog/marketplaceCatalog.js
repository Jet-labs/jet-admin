/**
 * LEGACY v1 catalog, retained for compatibility and historical review only.
 * It repeats connector families across generic starters and does NOT meet the
 * usable-integration bar. Structural validity is not runtime evidence.
 * Do not publish it as a verified catalog. New seeding uses curatedMarketplace.
 */
const crypto = require("crypto");
const { INTEGRATION_FAMILIES } = require("./integrationFamilies");

const CATALOG_VERSION = "marketplace-v1";
const MARKETPLACE_ITEM_TYPES = ["datasource", "widget", "workflow", "appTemplate"];
const WIDGET_TYPES = ["vega", "stat", "table", "progress", "timeline", "list"];

/** Stable, RFC-4122-shaped UUID derived from a catalog key. */
function uuidFromKey(key) {
  const bytes = crypto
    .createHash("sha256")
    .update(`${CATALOG_VERSION}:${key}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const CATEGORY_PURPOSE = {
  Databases: "relational or document tables",
  "Data & Analytics": "analytics and reporting datasets",
  Messaging: "event streams and notifications",
  "Payments & Commerce": "transactions, orders and customer records",
  "DevOps & Infrastructure": "builds, deployments and cloud resources",
  Monitoring: "metrics, incidents and error events",
  "Storage & Files": "objects, folders and file metadata",
  "Identity & Security": "users, groups and access policies",
  "Productivity & Content": "tasks, documents and collaboration records",
};

function descriptionFor(family, itemType, widgetType) {
  const purpose = CATEGORY_PURPOSE[family.category] || "operational records";
  const source = `${family.name} ${purpose}`;
  switch (itemType) {
    case "datasource":
      return `Connect ${family.name} as a datasource using the ${family.datasourceType} connector. Query ${purpose} and use them as inputs for dashboards and automations.`;
    case "widget":
      return `${family.name} Insights is a ready-to-use ${widgetType} widget that visualizes ${source}. Drop it onto an app page to monitor key ${family.name} activity.`;
    case "workflow":
      return `${family.name} Data Sync is a starter workflow that pulls ${source} on a manual trigger and hands the result to the next step. Extend the nodes with your own query and destination.`;
    case "appTemplate":
      return `${family.name} Admin App is a starter app page for browsing ${source}, with a summary block and a data grid wired for a ${family.name} datasource.`;
    default:
      return `${family.name} integration item.`;
  }
}

function widgetConfigFor(family, widgetType) {
  const label = family.name;
  switch (widgetType) {
    case "vega":
      return {
        chartType: "bar",
        title: `${label} activity over time`,
        xAxis: { field: "date", label: "Date" },
        yAxis: { field: "value", label: "Count" },
        mark: "bar",
        encoding: { x: { field: "date", type: "temporal" }, y: { field: "value", type: "quantitative" } },
        height: 300,
        theme: "default",
      };
    case "stat":
      return {
        label: `Total ${label} records`,
        value: 0,
        prefix: "",
        suffix: "",
        comparisonLabel: "vs last period",
        trend: "up",
        numberFormat: "0,0",
      };
    case "table":
      return {
        columns: [
          { field: "id", headerName: "ID", width: 140 },
          { field: "name", headerName: "Name", width: 200 },
          { field: "status", headerName: "Status", width: 120 },
          { field: "updatedAt", headerName: "Updated", width: 160 },
        ],
        pageSize: 10,
        pagination: true,
        sortable: true,
        filterable: true,
      };
    case "progress":
      return { label: `${label} completion`, value: 0, min: 0, max: 100, showValue: true, color: family.iconColor };
    case "timeline":
      return {
        title: `${label} event timeline`,
        items: [
          { id: "sample-1", label: `Latest ${label} event`, timestamp: "2026-01-01T00:00:00Z" },
        ],
        orientation: "vertical",
      };
    case "list":
    default:
      return {
        title: `Recent ${label} records`,
        items: [],
        emptyMessage: `No ${label} records yet`,
        pageSize: 10,
      };
  }
}

function workflowPayloadFor(family, title, description) {
  const triggerID = uuidFromKey(`${family.key}-wf-trigger`);
  const stepID = uuidFromKey(`${family.key}-wf-step`);
  const endID = uuidFromKey(`${family.key}-wf-end`);
  return {
    title,
    description,
    workflowOptions: {
      enabled: true,
      manualTrigger: true,
      retryLimit: 3,
      timeoutSeconds: 300,
      tags: ["marketplace", "sync", family.key],
    },
    nodes: [
      {
        nodeID: triggerID,
        nodeType: "start",
        nodeConfig: { label: `Sync ${family.name} (manual)`, trigger: "manual" },
      },
      {
        nodeID: stepID,
        nodeType: "dataQuery",
        nodeConfig: {
          label: `Read ${family.name} records`,
          datasourceType: family.datasourceType,
          description: "Replace with a saved query against your connected datasource.",
          query: "",
        },
      },
      {
        nodeID: endID,
        nodeType: "end",
        nodeConfig: { label: `Finish ${family.name} sync`, status: "completed" },
      },
    ],
    edges: [
      { upstreamNodeID: triggerID, downstreamNodeID: stepID },
      { upstreamNodeID: stepID, downstreamNodeID: endID },
    ],
  };
}

function appPagePayloadFor(family, title, description) {
  return {
    appPageTitle: title,
    appPageDescription: description,
    appPageConfig: {
      version: 1,
      layout: {
        type: "grid",
        columns: 12,
        blocks: [
          {
            id: uuidFromKey(`${family.key}-app-header`),
            type: "heading",
            props: { text: `${family.name} overview`, level: 1 },
          },
          {
            id: uuidFromKey(`${family.key}-app-summary`),
            type: "stat",
            props: { label: `Active ${family.name} records`, valueKey: "total" },
          },
          {
            id: uuidFromKey(`${family.key}-app-grid`),
            type: "table",
            props: { title: `${family.name} records`, pageSize: 10, dataSourceKey: "records" },
          },
        ],
      },
      variables: [{ key: "records", type: "array", defaultValue: [] }],
      dataSources: [
        { key: "records", kind: "datasource", datasourceType: family.datasourceType },
      ],
    },
  };
}

function makeBundle({ bundleItemType, itemId, title, description, family, widgetType }) {
  let payload;
  switch (bundleItemType) {
    case "datasource":
      payload = {
        datasourceTitle: title,
        datasourceType: family.datasourceType,
        datasourceDescription: description,
        datasourceTags: [...new Set(["marketplace", "integration", ...family.tags])],
        datasourceOptions: {},
        requiresReconnect: true,
      };
      break;
    case "widget":
      payload = {
        widgetTitle: title,
        widgetType,
        widgetDescription: description,
        widgetTags: [...new Set(["marketplace", "integration", widgetType])],
        widgetConfig: widgetConfigFor(family, widgetType),
        refreshInterval: 60,
      };
      break;
    case "workflow":
      payload = workflowPayloadFor(family, title, description);
      break;
    case "appPage":
      payload = appPagePayloadFor(family, title, description);
      break;
    default:
      throw new Error(`Unsupported bundle item type: ${bundleItemType}`);
  }

  return {
    bundleVersion: 1,
    generator: "marketplace-catalog",
    exportedAt: "2026-11-21T00:00:00.000Z",
    items: [{ type: bundleItemType, id: itemId, payload, dependencies: [] }],
  };
}

function baseItem({ family, itemType, suffix, bundleItemType, title, description, widgetType }) {
  const slug = `${family.key}-${suffix}`;
  const widgetTag = widgetType ? [widgetType] : [];
  return {
    itemID: uuidFromKey(slug),
    slug,
    itemType,
    title,
    description,
    category: family.category,
    tags: [...new Set([...family.tags, "integration", itemType, ...widgetTag])],
    icon: family.icon,
    iconColor: family.iconColor,
    publisher: "jet-admin",
    version: "1.0.0",
    payload: makeBundle({
      bundleItemType,
      itemId: uuidFromKey(`${slug}-bundle-item`),
      title,
      description,
      family,
      widgetType,
    }),
    isVerified: false,
    installCount: 0,
    sourceFamily: family.key,
    publishedByUserID: null,
  };
}

/** Build the full deterministic catalog (400-500 items). */
function buildCatalog() {
  const items = [];
  for (const family of INTEGRATION_FAMILIES) {
    const connectorLabel = family.datasourceType || "restapi";

    items.push(
      baseItem({
        family,
        itemType: "datasource",
        suffix: "datasource",
        bundleItemType: "datasource",
        title: `${family.name} Connector`,
        description: descriptionFor(family, "datasource"),
      })
    );

    const widgetType = WIDGET_TYPES[items.length % WIDGET_TYPES.length];
    items.push(
      baseItem({
        family,
        itemType: "widget",
        suffix: "widget",
        bundleItemType: "widget",
        widgetType,
        title: `${family.name} Insights`,
        description: descriptionFor(family, "widget", widgetType),
      })
    );

    items.push(
      baseItem({
        family,
        itemType: "workflow",
        suffix: "sync-workflow",
        bundleItemType: "workflow",
        title: `${family.name} Data Sync`,
        description: descriptionFor(family, "workflow"),
      })
    );

    items.push(
      baseItem({
        family,
        itemType: "appTemplate",
        suffix: "admin-app",
        bundleItemType: "appPage",
        title: `${family.name} Admin App`,
        description: descriptionFor(family, "appTemplate"),
      })
    );
  }

  if (items.length < 400 || items.length > 500) {
    throw new Error(
      `Catalog size ${items.length} is outside the required 400-500 range. ` +
        `Adjust INTEGRATION_FAMILIES (${INTEGRATION_FAMILIES.length} families).`
    );
  }
  return items;
}

function getCatalogStats(catalog = buildCatalog()) {
  const byType = {};
  const byCategory = {};
  for (const item of catalog) {
    byType[item.itemType] = (byType[item.itemType] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }
  return { total: catalog.length, families: INTEGRATION_FAMILIES.length, byType, byCategory };
}

module.exports = {
  CATALOG_VERSION,
  MARKETPLACE_ITEM_TYPES,
  WIDGET_TYPES,
  uuidFromKey,
  makeBundle,
  buildCatalog,
  getCatalogStats,
};
