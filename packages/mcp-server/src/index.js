#!/usr/bin/env node
/**
 * index.js — Jet Admin MCP Server (stdio transport)
 *
 * This is the main entry point. It starts an MCP server over stdio
 * so that MCP clients (Claude Desktop, Antigravity, etc.) can connect to it.
 *
 * Context model:
 *   In stdio mode  → context is assembled from env vars once per process.
 *                    One process = one tenant = one API key.
 *   In HTTP mode   → context is assembled per-request from the auth header.
 *                    One process = all tenants, fully concurrent.
 *   The tool handlers are IDENTICAL in both modes — they only see `context`.
 *
 * Protocol contract:
 *   - STDOUT: exclusively for MCP JSON-RPC messages
 *   - STDERR: for all logging, errors, and debug output
 *   - NEVER write plain text to stdout or the protocol will break
 *
 * Usage:
 *   node src/index.js
 *
 * Or via Claude Desktop config:
 *   {
 *     "mcpServers": {
 *       "jet-admin": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/packages/mcp-server/src/index.js"],
 *         "env": {
 *           "JET_ADMIN_BASE_URL": "http://localhost:5000",
 *           "JET_ADMIN_API_KEY": "your_api_key",
 *           "JET_ADMIN_TENANT_ID": "your_tenant_id"
 *         }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { config } from "./config.js";
import { allTools } from "./tools/index.js";

// ─── Global Error Safety ──────────────────────────────────────────────────────
// Without these, unhandled errors silently crash the process and the MCP
// client gets a broken pipe with no useful diagnostic message.

process.on("uncaughtException", (error) => {
  process.stderr.write(
    `[jet-admin-mcp] FATAL uncaughtException: ${error?.message || error}\n${error?.stack || ""}\n`
  );
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(
    `[jet-admin-mcp] FATAL unhandledRejection: ${reason?.message || reason}\n${reason?.stack || ""}\n`
  );
  process.exit(1);
});

// ─── Create MCP Server ────────────────────────────────────────────────────────

const server = new McpServer({
  name: "jet-admin",
  version: "1.0.0",
  description:
    "Jet Admin MCP Server — manage datasources, queries, widgets, " +
    "app pages, listeners, and workflows in your Jet Admin tenant.",
});

// ─── Register All Tools ───────────────────────────────────────────────────────

const apiKey = process.env.JET_ADMIN_API_KEY?.trim();
const tenantId = process.env.JET_ADMIN_TENANT_ID?.trim();

// Validate required env vars for stdio MCP server mode
if (!apiKey || !tenantId) {
  process.stderr.write(
    "[jet-admin-mcp] Error: JET_ADMIN_API_KEY and JET_ADMIN_TENANT_ID environment variables are required to run the stdio MCP server.\n" +
      "  Please define them in packages/mcp-server/.env or set them in your environment.\n"
  );
  process.exit(1);
}

/**
 * In stdio mode the context is read from env vars.
 * In HTTP mode this would be extracted from the authenticated request instead.
 * The tool handlers never know the difference — they only consume `context`.
 */
const stdioContext = {
  tenantId,
  apiKey,
};

for (const tool of allTools) {
  try {
    /**
     * Build a zod schema from the JSON Schema inputSchema.
     * The MCP SDK accepts a zod schema for type safety.
     * We convert the JSON Schema properties to zod fields dynamically.
     */
    const zodShape = buildZodShape(
      tool.inputSchema?.properties || {},
      tool.inputSchema?.required || []
    );

    server.tool(
      tool.name,
      tool.description,
      zodShape,
      async (args) => {
        try {
          process.stderr.write(
            `[jet-admin-mcp] tool:${tool.name} called (tenant:${stdioContext.tenantId})\n`
          );

          // Pass context into the handler — this is the only place that differs
          // between stdio mode (env vars) and HTTP mode (per-request auth).
          const result = await tool.handler(args, stdioContext);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          process.stderr.write(
            `[jet-admin-mcp] tool:${tool.name} error: ${error?.message || error}\n`
          );

          // Return a structured error that the LLM can reason about
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    error: true,
                    message: error?.message || String(error),
                    tool: tool.name,
                    hint: getErrorHint(error),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }
      }
    );
  } catch (regError) {
    // A bad tool definition must not crash the whole server
    process.stderr.write(
      `[jet-admin-mcp] WARNING: Failed to register tool "${tool?.name}": ${regError?.message}\n`
    );
  }
}

// ─── Start Transport ──────────────────────────────────────────────────────────

const transport = new StdioServerTransport();

process.stderr.write(
  `[jet-admin-mcp] Starting server...\n` +
    `  Base URL  : ${config.baseUrl}\n` +
    `  Tenant ID : ${tenantId}\n` +
    `  API Key   : ${apiKey.slice(0, 8)}...\n` +
    `  Tools     : ${allTools.length}\n` +
    `  Retries   : ${config.retries} (base delay: ${config.retryDelay}ms)\n` +
    `  Transport : stdio\n`
);

await server.connect(transport);

process.stderr.write("[jet-admin-mcp] Server connected and ready.\n");

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
  process.stderr.write(`[jet-admin-mcp] Received ${signal} — shutting down gracefully...\n`);
  try {
    await server.close();
    process.stderr.write("[jet-admin-mcp] Server closed cleanly.\n");
  } catch (err) {
    process.stderr.write(`[jet-admin-mcp] Error during shutdown: ${err?.message}\n`);
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a JSON Schema properties object to a Zod shape.
 * Supports: string, number, boolean, object, array.
 *
 * @param {Record<string, object>} properties
 * @param {string[]} required
 * @returns {Record<string, import("zod").ZodType>}
 */
function buildZodShape(properties, required = []) {
  const shape = {};

  for (const [key, schema] of Object.entries(properties)) {
    let zodType = jsonSchemaToZod(schema);

    // Make optional if not in required array
    if (!required.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return shape;
}

/**
 * Converts a single JSON Schema type definition to a Zod type.
 * @param {object} schema
 * @returns {import("zod").ZodType}
 */
function jsonSchemaToZod(schema) {
  if (!schema) return z.any();

  switch (schema.type) {
    case "string":
      if (schema.enum) {
        // Guard: z.enum requires at least one element
        if (!Array.isArray(schema.enum) || schema.enum.length === 0) {
          return z.string().describe(schema.description || "");
        }
        return z.enum(schema.enum).describe(schema.description || "");
      }
      return z.string().describe(schema.description || "");

    case "number":
    case "integer":
      return z.number().describe(schema.description || "");

    case "boolean":
      return z.boolean().describe(schema.description || "");

    case "array":
      if (schema.items) {
        return z.array(jsonSchemaToZod(schema.items)).describe(schema.description || "");
      }
      return z.array(z.any()).describe(schema.description || "");

    case "object":
      if (schema.properties) {
        const nested = buildZodShape(schema.properties, schema.required || []);
        return z.object(nested).describe(schema.description || "");
      }
      return z.record(z.any()).describe(schema.description || "");

    default:
      return z.any().describe(schema.description || "");
  }
}

/**
 * Returns a user-friendly hint based on the error type.
 * @param {Error} error
 * @returns {string}
 */
function getErrorHint(error) {
  if (!error) return "An unknown error occurred.";
  if (error.status === 401 || error.status === 403) {
    return "Authentication failed. Check that JET_ADMIN_API_KEY is valid and has sufficient permissions.";
  }
  if (error.status === 404) {
    return "Resource not found. Verify the ID is correct and belongs to the configured tenant.";
  }
  if (error.status === 429) {
    return "Rate limit exceeded. Wait a moment before retrying, or reduce request frequency.";
  }
  if (error.status === 422 || error.status === 400) {
    return "Validation error. Check that all required fields are provided and have correct types.";
  }
  if (error.status >= 500) {
    return "The Jet Admin backend returned a server error. Check backend logs for details.";
  }
  if (
    error.message?.includes("unreachable") ||
    ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(error.code)
  ) {
    return `Cannot connect to Jet Admin backend at ${config.baseUrl}. Ensure the backend is running.`;
  }
  return "See error message above for details.";
}
