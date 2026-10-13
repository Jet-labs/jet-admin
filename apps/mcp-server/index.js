/**
 * index.js — Jet Admin MCP HTTP Server
 *
 * Standalone Express app that exposes the Jet Admin MCP tools over the
 * Streamable HTTP transport (the production-grade MCP transport).
 *
 * Auth model:
 *   Every request MUST carry a valid Firebase Bearer token in the
 *   Authorization header. The token is verified here, then forwarded as
 *   the toolContext.bearerToken into every tool handler so tool calls
 *   run under the calling user's own Casbin permissions — exactly the
 *   same enforcement as a direct API call from that user.
 *
 * Per-request McpServer pattern (stateless):
 *   A fresh McpServer + StreamableHTTPServerTransport is created for
 *   each request. This avoids session state leakage across tenants.
 *
 * Why dynamic import for tools:
 *   environment.js must run (dotenv.config) before the tool modules
 *   load their own config (which reads JET_ADMIN_MCP_BASE_URL).
 *   Static imports are hoisted so we use await import() for the tools
 *   to guarantee env is set first.
 */

// ─── 1. Environment (must be first — loads .env before tools read it) ─────────
import { environment } from './environment.js';

// ─── 2. Static dependencies ───────────────────────────────────────────────────
import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

// ─── 3. Tools (dynamic import — after env is set) ─────────────────────────────
const { allTools } = await import('@jet-admin/mcp-server');

// ─── Firebase Admin ───────────────────────────────────────────────────────────

let firebaseApp;
try {
  const credentials = JSON.parse(environment.FIREBASE_CREDENTIALS);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
} catch (err) {
  process.stderr.write(
    `[mcp-server] FATAL: Failed to initialize Firebase Admin: ${err.message}\n`
  );
  process.exit(1);
}

// ─── Zod schema helpers (mirrors packages/mcp-server/src/index.js) ───────────

function buildZodShape(properties = {}, required = []) {
  const shape = {};
  for (const [key, schema] of Object.entries(properties)) {
    let zodType = jsonSchemaToZod(schema);
    if (!required.includes(key)) zodType = zodType.optional();
    shape[key] = zodType;
  }
  return shape;
}

function jsonSchemaToZod(schema) {
  if (!schema) return z.any();
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        if (!Array.isArray(schema.enum) || schema.enum.length === 0) {
          return z.string().describe(schema.description || '');
        }
        return z.enum(schema.enum).describe(schema.description || '');
      }
      return z.string().describe(schema.description || '');
    case 'number':
    case 'integer':
      return z.number().describe(schema.description || '');
    case 'boolean':
      return z.boolean().describe(schema.description || '');
    case 'array':
      if (schema.items) {
        return z.array(jsonSchemaToZod(schema.items)).describe(schema.description || '');
      }
      return z.array(z.any()).describe(schema.description || '');
    case 'object':
      if (schema.properties) {
        const nested = buildZodShape(schema.properties, schema.required || []);
        return z.object(nested).describe(schema.description || '');
      }
      return z.record(z.any()).describe(schema.description || '');
    default:
      return z.any().describe(schema.description || '');
  }
}

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', tools: allTools.length, timestamp: new Date() });
});

/**
 * MCP Streamable HTTP endpoint — one per tenant.
 *
 * POST /tenants/:tenantID/mcp
 *   Accepts MCP JSON-RPC messages from @ai-sdk/mcp or any MCP HTTP client.
 *   Validates the Firebase Bearer token, then dispatches tool calls under
 *   that user's identity.
 *
 * GET /tenants/:tenantID/mcp
 *   Opens an SSE stream for server-initiated notifications (MCP spec).
 *   The @ai-sdk/mcp HTTP client does not require this for tool calling,
 *   but we handle it for full spec compliance.
 */
async function mcpHandler(req, res) {
  // ── Auth: verify Firebase Bearer token ─────────────────────────────────
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
  }

  const bearerToken = authHeader.slice(7);
  try {
    await firebaseApp.auth().verifyIdToken(bearerToken);
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase token' });
  }

  const { tenantID } = req.params;
  if (!tenantID) {
    return res.status(400).json({ error: 'Bad Request: tenantID is required' });
  }

  // ── Build tool context (same shape expected by all tool handlers) ──────
  const toolContext = {
    tenantId: tenantID,
    apiKey: null,         // not used — bearerToken takes priority in createApiClient
    bearerToken,
  };

  // ── Create a fresh per-request MCP server (stateless) ─────────────────
  const server = new McpServer({
    name: 'jet-admin',
    version: '1.0.0',
  });

  for (const tool of allTools) {
    const zodShape = buildZodShape(
      tool.inputSchema?.properties || {},
      tool.inputSchema?.required || []
    );

    server.tool(tool.name, tool.description, zodShape, async (args) => {
      if (environment.DEBUG) {
        process.stderr.write(
          `[mcp-server] tool:${tool.name} tenant:${tenantID}\n`
        );
      }
      try {
        const result = await tool.handler(args, toolContext);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        process.stderr.write(
          `[mcp-server] tool:${tool.name} error: ${err?.message}\n`
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: true, message: err?.message || String(err), tool: tool.name }),
          }],
          isError: true,
        };
      }
    });
  }

  // ── Connect stateless transport and handle request ─────────────────────
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session tracking
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    process.stderr.write(`[mcp-server] transport error: ${err?.message}\n`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal MCP server error' });
    }
  }
}

app.post('/tenants/:tenantID/mcp', mcpHandler);
app.get('/tenants/:tenantID/mcp', mcpHandler);

// ─── Graceful error handling ──────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  process.stderr.write(`[mcp-server] FATAL uncaughtException: ${err?.message}\n${err?.stack || ''}\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[mcp-server] FATAL unhandledRejection: ${reason?.message || reason}\n`);
  process.exit(1);
});

// ─── Start server ─────────────────────────────────────────────────────────────

const server = app.listen(environment.PORT, () => {
  process.stderr.write(
    `[mcp-server] Ready\n` +
    `  Port  : ${environment.PORT}\n` +
    `  Target: ${environment.JET_ADMIN_BACKEND_URL}\n` +
    `  Tools : ${allTools.length}\n`
  );
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
