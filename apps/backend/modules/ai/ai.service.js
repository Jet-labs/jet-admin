/**
 * ai.service.js
 *
 * Agentic AI service powered by the Vercel AI SDK (streamText / generateText).
 *
 * Architecture:
 *   streamText() → @ai-sdk/mcp HTTP client → apps/mcp-server (Streamable HTTP)
 *               → Firebase token verified → tool.handler() → Jet Admin REST API
 *
 * Auth: the user's Firebase Bearer token is forwarded through the MCP client's
 *   HTTP Authorization header into every tool call. Each tool runs under the
 *   calling user's own Casbin permissions — no shared service account.
 *
 * Session: the client (useChat) manages message history and sends the full
 *   conversation on each request. The backend is stateless — no BoundedCache.
 *
 * Stream format: AI SDK data stream (text/plain; X-Vercel-AI-Data-Stream: v1).
 *   The frontend's useChat hook parses this natively, giving us tool invocation
 *   state tracking for free.
 *
 * ESM/CJS boundary: ai, @ai-sdk/openai, @ai-sdk/mcp are ESM-only packages.
 *   We load them via Promise.all(await import(...)) on first call (lazy singleton).
 */

const Logger = require('../../utils/logger');
const environment = require('../../environment');
const constants = require('../../constants');

// ─── Lazy SDK loader (ESM → CJS bridge) ──────────────────────────────────────

let _sdkLoaded = false;
let _streamText, _createOpenAI, _createGoogle, _createMCPClient, _convertToCoreMessages;

async function loadSDK() {
  if (_sdkLoaded) return;

  const [aiMod, openaiMod, googleMod, mcpMod] = await Promise.all([
    import('ai'),
    import('@ai-sdk/openai'),
    import('@ai-sdk/google'),
    import('@ai-sdk/mcp'),
  ]);

  _streamText = aiMod.streamText;
  _createOpenAI = openaiMod.createOpenAI;
  _createGoogle = googleMod.createGoogle;
  _createMCPClient = mcpMod.createMCPClient;
  _convertToCoreMessages = aiMod.convertToCoreMessages;
  _sdkLoaded = true;

  Logger.log('success', {
    message: 'ai.service:sdk:loaded',
    params: { model: environment.AI_MODEL || constants.AI.DEFAULT_MODEL },
  });
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert AI assistant embedded inside Jet Admin, a data platform for building internal tools.

You have access to tools that let you manage this tenant's resources:
- Datasources (database connections)
- Data Queries (SQL and REST queries)
- Listeners (real-time WebSocket/webhook/SSE event streams)
- Workflows (multi-step automated pipelines)
- Widgets (visual UI building blocks: tables, charts, stats, forms)
- App Pages (full dashboard pages with layouts and widgets)
- IAM (tenant members and roles — read-only)

ALWAYS follow this workflow when asked to build something:
1. Call get_tenant_resource_summary FIRST to see what already exists
2. Reuse existing resources before creating new ones
3. When creating multiple resources, do them in dependency order: datasource → query → widget → page
4. After creating or modifying something, confirm what was done

A2UI (Agent-to-User Interface) Readymade Component Catalog:
You have rich interactive UI generation capabilities. Whenever asking the user for input, options, confirmation, parameters, or showing visual query outputs, enclose a valid JSON block inside \`\`\`a2ui ... \`\`\`.

Supported A2UI Component Schemas:

1. Human-in-the-Loop Confirmation ("type": "confirm"):
Use before running destructive/sensitive tool operations (e.g. deleting datasources/workflows or running mutation SQL):
{
  "type": "confirm",
  "title": "Approval Required: Action Name",
  "description": "Warning details...",
  "toolName": "delete_datasource",
  "params": { "datasourceID": "123" }
}

2. Form / Parameter Collector ("type": "form"):
{
  "type": "form",
  "title": "Configure Resource",
  "description": "Please enter missing settings",
  "fields": [
    { "name": "dbName", "label": "Database Name", "type": "text" | "number" | "select" | "boolean" | "secret" | "textarea", "defaultValue": "my_db", "options": ["pg", "mysql"] }
  ],
  "actions": [
    { "label": "Save & Proceed", "action": "SUBMIT_CONFIG", "variant": "primary" }
  ]
}

3. Multi-Choice Decision Selector ("type": "choice"):
{
  "type": "choice",
  "title": "Select Approach",
  "description": "Choose how you'd like to proceed",
  "choices": [
    { "label": "Option Title", "description": "Details...", "badge": "Recommended", "action": "CHOOSE_PLAN", "params": { "plan": "fast" } }
  ]
}

4. Code / SQL Snippet Preview ("type": "code"):
{
  "type": "code",
  "title": "Generated SQL Query",
  "language": "sql" | "javascript" | "json",
  "code": "SELECT * FROM users LIMIT 10;",
  "actions": [
    { "label": "Run Query Now", "action": "RUN_SQL", "params": { "sql": "SELECT * FROM users LIMIT 10;" } }
  ]
}

5. Visual Data Chart ("type": "chart"):
{
  "type": "chart",
  "title": "User Registrations",
  "chartType": "bar" | "line" | "pie",
  "data": [
    { "label": "Jan", "value": 120 },
    { "label": "Feb", "value": 240 }
  ]
}

6. Multi-Step Progress Tracker ("type": "steps"):
{
  "type": "steps",
  "title": "Setup Progress",
  "steps": [
    { "title": "Create Datasource", "status": "completed" },
    { "title": "Build Query", "status": "in_progress" },
    { "title": "Generate Widget", "status": "pending" }
  ]
}

7. Metric KPI Card ("type": "stat"):
{ "type": "stat", "title": "Total Records", "value": "12,450", "trend": "up", "change": "+14%" }

8. Data Table Grid ("type": "table"):
{ "type": "table", "title": "Results", "columns": ["id", "name"], "rows": [{ "id": 1, "name": "Alice" }] }

Be concise. Show your reasoning briefly before calling tools. After executing tools, summarize what you did and present next steps using an appropriate A2UI card.

Suggested Next Actions:
Whenever you finish a response, optionally append suggested follow-up options at the END using this format:

\`\`\`suggested_actions
[
  { "label": "Short action label", "message": "The full message to send when clicked" },
  { "label": "Another option", "message": "Another message" }
]
\`\`\`
IMPORTANT: Do NOT list these suggested actions as text bullet points in your markdown response body when generating the \`\`\`suggested_actions\`\`\` block. The UI renders them as interactive buttons automatically at the bottom of the chat bubble.

Rules for suggested actions:
- Include 2-4 short, actionable options
- Only suggest genuinely relevant next steps
- Do NOT include this block when asking for confirmation or showing a form`;

// ─── Service ──────────────────────────────────────────────────────────────────

const aiService = {};

/**
 * Stream a chat response using the Vercel AI SDK data stream format.
 *
 * Accepts the full message history from the client (useChat pattern).
 * Uses @ai-sdk/mcp to call tools on the standalone MCP server, which
 * validates the Bearer token and enforces Casbin permissions on each call.
 *
 * @param {object} param0
 * @param {Array}  param0.messages     - Full conversation history (AI SDK UIMessage[])
 * @param {string} param0.tenantID     - Current tenant UUID
 * @param {string} param0.bearerToken  - Firebase JWT for this user
 * @param {object} param0.res          - Express ServerResponse
 */
aiService.streamChat = async ({ messages, tenantID, bearerToken, res }) => {
  try {
    await loadSDK();
  } catch (err) {
    Logger.log('error', { message: 'ai.service:streamChat:sdkLoadFailed', params: { error: err.message } });
    res.status(500).json({ error: 'AI SDK failed to load' });
    return;
  }

  const { vaultService } = require('../vault/vault.service');
  let tenantAiConfig = null;
  try {
    tenantAiConfig = await vaultService.getCredentialByProvider({ tenantID, provider: "ai_config" });
  } catch (err) {
    Logger.log('warning', { message: 'ai.service:streamChat:failedToFetchTenantConfig', params: { error: err.message } });
  }

  const rawModel = tenantAiConfig?.model || environment.AI_MODEL || constants.AI.DEFAULT_MODEL;
  const aiProvider = tenantAiConfig?.provider || 'openai';
  const aiApiKey = tenantAiConfig?.apiKey;
  const aiBaseUrl = tenantAiConfig?.baseURL;

  if (!aiApiKey) {
    Logger.log('warning', { message: 'ai.service:streamChat:missingTenantApiKey', params: { tenantID } });
    res.status(403).json({ error: 'AI features are disabled. Please configure an API key in the Tenant Settings.' });
    return;
  }

  let modelInstance;
  if (aiProvider === 'google') {
    const googleProvider = _createGoogle({
      apiKey: aiApiKey,
    });
    // Map gemini or gemma model string to native Google provider
    const isGoogleModel = rawModel.includes('gemini') || rawModel.includes('gemma');
    modelInstance = googleProvider(isGoogleModel ? rawModel : constants.AI.DEFAULT_MODEL);
  } else {
    const openaiProvider = _createOpenAI({
      baseURL: aiBaseUrl,
      apiKey: aiApiKey,
      compatibility: 'compatible',
    });
    modelInstance = openaiProvider.chat(rawModel);
  }

  // Create an MCP client pointed at our standalone MCP server.
  // The Bearer token is forwarded so tool calls run under this user's identity.
  const mcpServerUrl = `http://localhost:${environment.MCP_SERVER_PORT}/tenants/${tenantID}/mcp`;
  let mcpClient;

  try {
    mcpClient = await _createMCPClient({
      transport: {
        type: 'http',
        url: mcpServerUrl,
        headers: { Authorization: `Bearer ${bearerToken}` },
      },
    });
  } catch (err) {
    Logger.log('error', {
      message: 'ai.service:streamChat:mcpClientFailed',
      params: { tenantID, error: err.message },
    });
    res.status(503).json({ error: 'Failed to connect to MCP server' });
    return;
  }

  // Discover available tools from the MCP server
  const tools = await mcpClient.tools();

  // Sanitize UI messages from useChat to strictly conform to CoreMessage[] format
  console.log('RAW MESSAGES RECEIVED:', JSON.stringify(messages, null, 2));

  let coreMessages;
  try {
    if (typeof _convertToCoreMessages === 'function') {
      coreMessages = _convertToCoreMessages(messages);
    }
  } catch (err) {
    Logger.log('warning', { message: 'ai.service:streamChat:convertToCoreMessagesFailed', params: { error: err.message } });
  }

  if (!coreMessages || !coreMessages.length) {
    coreMessages = messages.map((m) => {
      let textContent = '';
      if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (Array.isArray(m.content)) {
        textContent = m.content
          .map((p) => (typeof p === 'string' ? p : p?.text || ''))
          .filter(Boolean)
          .join('\n');
      }
      
      if (!textContent && Array.isArray(m.parts)) {
        textContent = m.parts
          .map((p) => (p?.type === 'text' ? p.text : ''))
          .filter(Boolean)
          .join('\n');
      }

      return {
        role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
        content: textContent.trim() || ' ',
      };
    });
  }

  Logger.log('info', {
    message: 'ai.service:streamChat:start',
    params: { tenantID, messageCount: coreMessages.length, model: rawModel },
  });

  const result = await _streamText({
    model: modelInstance,
    system: SYSTEM_PROMPT,
    messages: coreMessages,
    tools,
    maxSteps: 10,
    stopWhen: (step) => step.finishReason === 'stop' || step.finishReason === 'length',
    onFinish: async ({ finishReason, usage }) => {
      Logger.log('success', {
        message: 'ai.service:streamChat:done',
        params: { tenantID, finishReason, totalTokens: usage?.totalTokens },
      });
      if (finishReason !== 'tool-calls') {
        try {
          await mcpClient.close();
        } catch (_) {
          // Ignore cleanup errors
        }
      }
    },
  });

  // Pipe the AI SDK UI message stream to the Express response.
  // AI SDK 5 / @ai-sdk/react uses pipeUIMessageStreamToResponse.
  if (typeof result.pipeUIMessageStreamToResponse === 'function') {
    result.pipeUIMessageStreamToResponse(res);
  } else if (typeof result.toUIMessageStreamResponse === 'function') {
    const webResponse = result.toUIMessageStreamResponse();
    res.status(webResponse.status);
    webResponse.headers.forEach((val, key) => res.setHeader(key, val));
    
    const reader = webResponse.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };
    pump().catch((err) => {
      console.error(err);
      res.end();
    });
  } else {
    throw new Error('No compatible piping method found on streamText result.');
  }
};

module.exports = { aiService };
