/**
 * tools/index.js
 *
 * Central registry — imports all tool definitions and exports
 * them as a flat array ready for MCP server registration.
 */

import { datasourceTools } from "./datasource.tools.js";
import { queryTools } from "./query.tools.js";
import { listenerTools } from "./listener.tools.js";
import { workflowTools } from "./workflow.tools.js";
import { widgetTools } from "./widget.tools.js";
import { appPageTools } from "./appPage.tools.js";
import { iamTools } from "./iam.tools.js";
import { introspectionTools } from "./introspection.tools.js";

/**
 * All MCP tools exposed by the Jet Admin MCP Server.
 * Each entry has: { name, description, inputSchema, handler }
 */
export const allTools = [
  // Discovery — call these FIRST
  ...introspectionTools,
  // Core CRUD
  ...datasourceTools,
  ...queryTools,
  ...listenerTools,
  ...workflowTools,
  ...widgetTools,
  ...appPageTools,
  // IAM (read-only)
  ...iamTools,
];

export const toolMap = new Map(allTools.map((t) => [t.name, t]));

process.stderr.write(
  `[jet-admin-mcp] Registered ${allTools.length} tools:\n` +
    allTools.map((t) => `  • ${t.name}`).join("\n") +
    "\n"
);
