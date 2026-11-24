#!/usr/bin/env node
/**
 * Generates static catalog JSON for the MCP server from the platform packages
 * that are the source of truth. Run from the repo root:
 *
 *   node packages/mcp-server/scripts/generate-catalogs.mjs
 *
 * The generated files are committed so the MCP package stays self-contained
 * (it cannot depend on React/workflow UI packages at runtime).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../src/data/generated');
fs.mkdirSync(outDir, { recursive: true });

const wf = await import('@jet-admin/workflow-nodes');
const ds = await import('@jet-admin/datasource-types');
const wt = await import('@jet-admin/widget-types');

// Workflow nodes: include every map entry, even those without a JSON schema
// (dataCollection currently has only defaultValue). The MCP adds a curated
// schema for those in nodeContracts.js.
const nodes = Object.values(wf.WORKFLOW_NODES_MAP).map((n) => ({
  value: n.value,
  label: n.label,
  hasSchema: Boolean(n.schema),
  schema: n.schema || null,
  uischema: n.uischema || null,
  defaults: n.defaultValue || null,
}));

const datasources = Object.values(ds.DATASOURCE_TYPES).map((d) => ({
  value: d.value,
  name: d.name,
  supportsListener: Boolean(d.listenerConfigForm || d.supportsListener),
  hasListenerConfig: Boolean(d.listenerConfigForm),
  hasQueryConfig: Boolean(d.queryConfigForm),
}));

const widgets = Object.values(wt.WIDGET_DESCRIPTORS).map((d) => ({
  type: d.type,
  category: d.category || null,
  tags: d.tags || [],
  dataKey: d.dataKey || null,
  required: d.required || [],
}));

const payloads = {
  'workflow-nodes.json': nodes,
  'datasource-types.json': datasources,
  'widget-types.json': widgets,
};
for (const [file, data] of Object.entries(payloads)) {
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${file}: ${Array.isArray(data) ? data.length : '?'} entries`);
}
