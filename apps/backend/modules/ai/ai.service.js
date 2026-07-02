/**
 * ai.service.js
 *
 * Core agentic AI service for Jet Admin.
 *
 * Uses NVIDIA NIM (OpenAI-compatible) with DeepSeek V4 Pro.
 * On each user message:
 *   1. Appends message to per-user-per-tenant session history
 *   2. Calls the LLM with all 46 MCP tools as OpenAI function definitions
 *   3. If the LLM returns tool_calls: executes each tool handler, feeds results back, loops
 *   4. Returns final assistant reply + full tool call trace
 *
 * Session isolation:
 *   sessionStore is keyed by "${userID}:${tenantID}" — no cross-user/cross-tenant leakage.
 *
 * Auth propagation for tool calls:
 *   The user's Firebase Bearer token (from the original HTTP request) is stored in the session
 *   and passed as `context.bearerToken` into every MCP tool handler. Each tool call therefore
 *   runs under the calling user's own Casbin permissions — no shared service account needed.
 *   When the Bearer token expires (Firebase tokens last 1 hour), the user will need to re-open
 *   the app (which refreshes the token automatically) and start a new chat session.
 */

const OpenAI = require("openai");
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const environment = require("../../environment");

// ─── Import MCP tool handlers ────────────────────────────────────────────────
// We require them at runtime to avoid issues with the CJS/ESM boundary.
// The tools package uses ESM, so we use a dynamic import wrapper.

let _toolsLoaded = false;
let _allTools = [];
let _toolMap = new Map();

async function loadTools() {
  if (_toolsLoaded) return;
  try {
    const mod = await import("../../../../packages/mcp-server/src/tools/index.js");
    _allTools = mod.allTools;
    _toolMap = mod.toolMap;
    _toolsLoaded = true;
    Logger.log("success", {
      message: "ai.service:tools:loaded",
      params: { count: _allTools.length },
    });
  } catch (err) {
    Logger.log("error", {
      message: "ai.service:tools:loadFailed",
      params: { error: err.message },
    });
    throw err;
  }
}

// ─── NVIDIA NIM client ────────────────────────────────────────────────────────

const nimClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: environment.NVIDIA_API_KEY,
});

const MODEL = "meta/llama-3.1-8b-instruct";

// ─── Session store ────────────────────────────────────────────────────────────
// In-memory; keyed by `${userID}:${tenantID}`
// Value: { messages: Message[], bearerToken: string }
//
// bearerToken: the user's Firebase JWT from the original HTTP request.
// It is refreshed on every new message (see chat() below) so we always
// have the freshest token even across hour-long sessions.

const sessionStore = new Map();

function getSessionKey(userID, tenantID) {
  return `${userID}:${tenantID}`;
}

/**
 * Converts the MCP allTools array to the OpenAI function calling format.
 * The inputSchema is already JSON Schema — OpenAI accepts it directly.
 */
function buildOpenAITools(allTools) {
  return allTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema || { type: "object", properties: {} },
    },
  }));
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

Be concise. Show your reasoning briefly before calling tools. After executing tools, summarize what you did and what the user can do next.

If a tool fails with a permissions error, explain that the tenant's API key needs the relevant permission enabled.`;

// ─── Main service ─────────────────────────────────────────────────────────────

const aiService = {};

/**
 * Send a message and run the agentic loop until a final response is ready.
 *
 * @param {object} param0
 * @param {string} param0.userID - Firebase UID of the current user
 * @param {string} param0.tenantID - Current tenant UUID
 * @param {string} param0.message - User's chat message
 * @returns {Promise<{ reply: string, toolCallSteps: Array, messages: Array }>}
 */
aiService.chat = async ({ userID, tenantID, message, bearerToken }) => {
  await loadTools();

  const sessionKey = getSessionKey(userID, tenantID);

  // Get or init session
  if (!sessionStore.has(sessionKey)) {
    sessionStore.set(sessionKey, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }],
      bearerToken: null,
    });
  }

  const session = sessionStore.get(sessionKey);

  // Always refresh the bearer token — Firebase tokens expire after 1 hour.
  // The frontend sends a fresh token with every message, so we update it here
  // so that long sessions don't break mid-conversation.
  if (bearerToken) {
    session.bearerToken = bearerToken;
  }

  if (!session.bearerToken) {
    return {
      reply:
        "Authentication token not found. Please refresh the page and try again.",
      toolCallSteps: [],
      messageCount: session.messages.length,
    };
  }

  // Build the tool context using the user's own identity
  const toolContext = {
    tenantId: tenantID,
    apiKey: null,             // not used — bearerToken takes priority in createApiClient
    bearerToken: session.bearerToken,
  };

  // Append user message
  session.messages.push({ role: "user", content: message });

  const openAITools = buildOpenAITools(_allTools);
  const toolCallSteps = [];

  Logger.log("info", {
    message: "ai.service:chat:start",
    params: { userID, tenantID, messageCount: session.messages.length },
  });

  // ── Agentic loop ────────────────────────────────────────────────────────────
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await nimClient.chat.completions.create({
      model: MODEL,
      messages: session.messages,
      tools: openAITools,
      tool_choice: "auto",
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
    });

    const choice = response.choices[0];
    const assistantMsg = choice.message;

    // Append assistant message to history
    session.messages.push(assistantMsg);

    Logger.log("info", {
      message: "ai.service:chat:llmResponse",
      params: {
        userID,
        tenantID,
        finishReason: choice.finish_reason,
        toolCallCount: assistantMsg.tool_calls?.length || 0,
        iteration: iterations,
      },
    });

    // If no tool calls, we're done
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      const reply = assistantMsg.content || "";
      Logger.log("success", {
        message: "ai.service:chat:done",
        params: { userID, tenantID, iterations, toolCallSteps: toolCallSteps.length },
      });
      return {
        reply,
        toolCallSteps,
        messageCount: session.messages.length,
      };
    }

    // Execute all tool calls in this turn
    for (const toolCall of assistantMsg.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

      Logger.log("info", {
        message: "ai.service:chat:toolCall",
        params: { userID, tenantID, toolName, toolCallId: toolCall.id },
      });

      let toolResult;
      let toolError = null;

      const handler = _toolMap.get(toolName);

      if (!handler) {
        toolError = `Tool "${toolName}" not found.`;
        toolResult = { error: toolError };
      } else {
        try {
          toolResult = await handler.handler(toolArgs, toolContext);
        } catch (err) {
          toolError = err.message;
          toolResult = { error: err.message };
          Logger.log("error", {
            message: "ai.service:chat:toolError",
            params: { userID, tenantID, toolName, error: err.message },
          });
        }
      }

      const resultStr = JSON.stringify(toolResult, null, 2);

      // Record step for UI display
      toolCallSteps.push({
        toolCallId: toolCall.id,
        toolName,
        args: toolArgs,
        result: toolResult,
        error: toolError,
      });

      // Append tool result message
      session.messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: resultStr,
      });
    }
    // Continue loop — LLM will process tool results
  }

  // Safety fallback if too many iterations
  const fallback =
    "I've been working on your request but reached the maximum number of steps. Please try a simpler request or break it into smaller parts.";
  session.messages.push({ role: "assistant", content: fallback });

  return {
    reply: fallback,
    toolCallSteps,
    messageCount: session.messages.length,
  };
};

/**
 * Stream a message through the agentic loop using Server-Sent Events.
 *
 * SSE event types:
 *   thinking   — DeepSeek reasoning token (delta.reasoning_content)
 *   text       — Assistant text token (delta.content)
 *   tool_start — { toolName, args }
 *   tool_end   — { toolName, result, error }
 *   done       — { messageCount }
 *   error      — { message }
 */
aiService.streamChat = async ({ userID, tenantID, message, bearerToken, res }) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  function emit(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
  function emitError(msg) {
    emit("error", { message: msg });
    res.end();
  }

  try {
    await loadTools();
  } catch (err) {
    return emitError(`Failed to load AI tools: ${err.message}`);
  }

  const sessionKey = getSessionKey(userID, tenantID);
  if (!sessionStore.has(sessionKey)) {
    sessionStore.set(sessionKey, {
      messages: [{ role: "system", content: SYSTEM_PROMPT }],
      bearerToken: null,
    });
  }
  const session = sessionStore.get(sessionKey);
  if (bearerToken) session.bearerToken = bearerToken;

  if (!session.bearerToken) {
    return emitError("Authentication token not found. Please refresh the page.");
  }

  const toolContext = {
    tenantId: tenantID,
    apiKey: null,
    bearerToken: session.bearerToken,
  };

  session.messages.push({ role: "user", content: message });
  const openAITools = buildOpenAITools(_allTools);

  Logger.log("info", {
    message: "ai.service:streamChat:start",
    params: { userID, tenantID, messageCount: session.messages.length },
  });

  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const stream = await nimClient.chat.completions.create({
      model: MODEL,
      messages: session.messages,
      tools: openAITools,
      tool_choice: "auto",
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
      stream: true,
    });

    let accText = "";
    let accThinking = "";
    let finishReason = null;
    // Tool call args arrive fragmented — accumulate by index
    const pendingToolCalls = new Map();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;
      finishReason = chunk.choices[0]?.finish_reason || finishReason;

      // Thinking tokens (DeepSeek reasoning_content field)
      if (delta.reasoning_content) {
        accThinking += delta.reasoning_content;
        emit("thinking", { content: delta.reasoning_content });
      }

      // Text tokens
      if (delta.content) {
        accText += delta.content;
        emit("text", { content: delta.content });
      }

      // Tool call fragments — stitch into pendingToolCalls map
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          if (!pendingToolCalls.has(idx)) {
            pendingToolCalls.set(idx, { id: "", name: "", argsBuffer: "" });
          }
          const p = pendingToolCalls.get(idx);
          if (tc.id) p.id = tc.id;
          if (tc.function?.name) p.name += tc.function.name;
          if (tc.function?.arguments) p.argsBuffer += tc.function.arguments;
        }
      }
    }

    // Persist assistant message
    const hasCalls = pendingToolCalls.size > 0;
    session.messages.push({
      role: "assistant",
      content: accText || null,
      ...(accThinking ? { reasoning_content: accThinking } : {}),
      ...(hasCalls
        ? {
            tool_calls: Array.from(pendingToolCalls.values()).map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: tc.argsBuffer },
            })),
          }
        : {}),
    });

    Logger.log("info", {
      message: "ai.service:streamChat:turnDone",
      params: { userID, tenantID, iteration: iterations, finishReason, toolCalls: pendingToolCalls.size },
    });

    // No tool calls — done
    if (!hasCalls) {
      emit("done", { messageCount: session.messages.length });
      res.end();
      return;
    }

    // Execute each tool call and stream events
    for (const [, tc] of pendingToolCalls) {
      const toolName = tc.name;
      let toolArgs = {};
      try { toolArgs = JSON.parse(tc.argsBuffer || "{}"); } catch (_) {}

      emit("tool_start", { toolName, args: toolArgs });
      Logger.log("info", {
        message: "ai.service:streamChat:toolCall",
        params: { userID, tenantID, toolName },
      });

      let toolResult;
      let toolError = null;
      const handler = _toolMap.get(toolName);

      if (!handler) {
        toolError = `Tool "${toolName}" not found.`;
        toolResult = { error: toolError };
      } else {
        try {
          toolResult = await handler.handler(toolArgs, toolContext);
        } catch (err) {
          toolError = err.message;
          toolResult = { error: err.message };
          Logger.log("error", {
            message: "ai.service:streamChat:toolError",
            params: { userID, tenantID, toolName, error: err.message },
          });
        }
      }

      emit("tool_end", { toolName, result: toolResult, error: toolError });
      session.messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(toolResult, null, 2),
      });
    }
    // Loop: feed tool results back to LLM
  }

  const fallback = "I've reached the maximum number of reasoning steps. Please try a simpler request.";
  session.messages.push({ role: "assistant", content: fallback });
  emit("text", { content: fallback });
  emit("done", { messageCount: session.messages.length });
  res.end();
};

/**
 * Get the current session message history (excluding system prompt).
 */
aiService.getSession = ({ userID, tenantID }) => {
  const sessionKey = getSessionKey(userID, tenantID);
  const session = sessionStore.get(sessionKey);
  if (!session) return { messages: [], messageCount: 0 };

  // Return all messages except system prompt
  const messages = session.messages.filter((m) => m.role !== "system");
  return { messages, messageCount: messages.length };
};

/**
 * Clear the session for a user+tenant.
 */
aiService.clearSession = ({ userID, tenantID }) => {
  const sessionKey = getSessionKey(userID, tenantID);
  sessionStore.delete(sessionKey);
  Logger.log("info", {
    message: "ai.service:clearSession",
    params: { userID, tenantID },
  });
  return { cleared: true };
};

module.exports = { aiService };
// force nodemon restart 2
