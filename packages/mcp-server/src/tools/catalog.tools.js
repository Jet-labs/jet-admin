// File: packages/mcp-server/src/tools/catalog.tools.js
/**
 * catalog.tools.js — plugin catalog discovery.
 *
 * Static lists are generated from the platform packages (source of truth):
 *   scripts/generate-catalogs.mjs
 * When the backend is reachable, the live /schemas keys are merged in so the
 * catalog cannot drift from the running build.
 */
import { createApiClient } from "../client.js";
import { GENERATED_DATASOURCE_TYPES, GENERATED_WIDGET_TYPES } from "../data/catalogs.js";
import { getAllNodeContracts, getNodeContract, NODE_TYPES } from "../data/nodeContracts.js";

async function liveKeys(fetcher) {
  try {
    const res = await fetcher();
    const map = res?.schemas || res;
    if (map && typeof map === "object" && !Array.isArray(map)) return Object.keys(map);
  } catch {}
  return null;
}

function mergeDatasourceTypes(live) {
  const byValue = new Map(GENERATED_DATASOURCE_TYPES.map((d) => [d.value, { ...d, liveSchema: false }]));
  if (live) {
    for (const key of live) {
      if (byValue.has(key)) byValue.get(key).liveSchema = true;
      else byValue.set(key, { value: key, name: key, supportsListener: false, hasListenerConfig: false, hasQueryConfig: false, liveSchema: true });
    }
  }
  return [...byValue.values()];
}

function mergeWidgetTypes(live) {
  const generated = GENERATED_WIDGET_TYPES.map((w) => w.type);
  if (!live) return [...new Set(generated)];
  return [...new Set([...generated, ...live])];
}

export const catalogTools = [
  {
    name: "list_datasource_types",
    description:
      "List ALL available datasource plugin types, generated from @jet-admin/datasource-types and merged with the live /datasources/schemas keys.\n\n" +
      "Returns: { totalCount, types: [{ value, name, supportsListener, liveSchema }] }.\n\n" +
      "Use this before create_datasource / test_datasource_connection. For connection shapes call get_datasource_schemas " +
      "with a datasourceType; for query shapes call get_data_query_schemas with a datasourceType.\n\n" +
      "Example: {} (no arguments)\n\nRelated: get_datasource_schemas, create_datasource, list_listener_types.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const live = await liveKeys(() => datasourceAPI.getSchemas({}));
      const types = mergeDatasourceTypes(live);
      return { totalCount: types.length, source: live ? "generated+live" : "generated", types };
    },
  },
  {
    name: "list_listener_types",
    description:
      "List the datasource types that can back a real-time listener.\n\n" +
      "Returns: { totalCount, types: [{ value, name, hasLiveSchema }] } — valid listenerType values for create_listener.\n\n" +
      "Derived from the generated datasource catalog and merged with live /listeners/schemas keys. For listenerConfig " +
      "shapes call get_listener_schemas; for pipeline actions call list_listener_action_types.\n\n" +
      "Example: {}\n\nRelated: create_listener, get_listener_schemas, list_listener_action_types.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const live = await liveKeys(() => listenerAPI.getSchemas({}));
      const liveSet = new Set(live || []);
      const types = GENERATED_DATASOURCE_TYPES.filter((d) => d.supportsListener).map((d) => ({
        value: d.value,
        name: d.name,
        hasLiveSchema: liveSet.has(d.value),
      }));
      return { totalCount: types.length, source: live ? "generated+live" : "generated", types };
    },
  },
  {
    name: "list_widget_types",
    description:
      "List ALL available widget types, generated from @jet-admin/widget-types and merged with live /widgets/schemas keys.\n\n" +
      "Returns: { totalCount, types: [string] }. NOTE: there is no 'chart' type — use 'vega' or 'vega-lite'.\n\n" +
      "For config shapes call get_widget_schemas with a widgetType. If an invalid type is rejected, this is the tool to call next.\n\n" +
      "Example: {}\n\nRelated: get_widget_schemas, create_widget.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const live = await liveKeys(() => widgetAPI.getSchemas({}));
      const types = mergeWidgetTypes(live);
      return { totalCount: types.length, source: live ? "generated+live" : "generated", types };
    },
  },
  {
    name: "list_workflow_node_types",
    description:
      "List ALL workflow node types (13 implemented + 2 declared-unimplemented), with schema availability.\n\n" +
      "Returns: { totalCount, implemented: [string], unimplemented: [string], types: [{ type, implemented, hasSchema }] }.\n\n" +
      "Use describe_node_type for config, handles, output and pitfalls. dataCollection is implemented but the platform " +
      "/workflows/schemas omits it; describe_node_type('dataCollection') supplies its contract.\n\n" +
      "Example: {}\n\nRelated: describe_node_type, get_workflow_schema, create_workflow.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const live = await liveKeys(() => workflowAPI.getSchemas({}));
      const liveSet = new Set(live || []);
      const implemented = NODE_TYPES;
      const unimplemented = ["connectorPull", "connectorPush"];
      const types = [
        ...implemented.map((type) => {
          const c = getNodeContract(type);
          return { type, implemented: true, hasSchema: Boolean(c?.schema), liveSchema: liveSet.has(type) };
        }),
        ...unimplemented.map((type) => ({ type, implemented: false, hasSchema: false, liveSchema: false })),
      ];
      return {
        totalCount: types.length,
        implemented,
        unimplemented,
        schemaGaps: implemented.filter((t) => !liveSet.has(t)),
        source: live ? "generated+live" : "generated",
        types,
      };
    },
  },
  {
    name: "describe_node_type",
    description:
      "Get the authoritative contract for ONE workflow node type: JSON schema, defaults, required config, output handles, " +
      "output shape and pitfalls.\n\n" +
      "ALWAYS call this before building a node, especially condition, switch, loop, dataCollection, approval, fanout, join, " +
      "or subWorkflow. It fixes the gaps in get_workflow_schema (e.g. switch.cases, fanout.branches, join.sourceVariables, " +
      "and the entirely-missing dataCollection schema).\n\n" +
      "Returns: { nodeType, label, hasSchema, required, handles, output, semantics, pitfalls, schema, defaults }.\n" +
      "handles tells you the legal edge sourceHandle values (dynamic ids are derived from the node's config).\n\n" +
      "Example: { \"nodeType\": \"join\" }\n\nRelated: list_workflow_node_types, validate_workflow, create_workflow.",
    inputSchema: {
      type: "object",
      properties: {
        nodeType: { type: "string", description: "One of: " + NODE_TYPES.join(", ") + "." },
      },
      required: ["nodeType"],
    },
    handler: async ({ nodeType }) => {
      const c = getNodeContract(nodeType);
      if (!c) {
        throw Object.assign(
          new Error(`Unknown workflow node type '${nodeType}'. Valid types: ${NODE_TYPES.join(", ")}.`),
          { code: "NODE_TYPE_INVALID" }
        );
      }
      return {
        ...c,
        relatedTools: ["validate_workflow", "create_workflow", "update_workflow", "get_workflow_schema"],
      };
    },
  },
];
