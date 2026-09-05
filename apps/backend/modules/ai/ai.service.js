/**
 * ai.service.js
 *
 * Jet — the dedicated agentic AI operator for Jet Admin.
 * Powered by the Vercel AI SDK (ToolLoopAgent + MCP tools).
 *
 * Architecture:
 *   ToolLoopAgent → @ai-sdk/mcp HTTP client → apps/mcp-server (Streamable HTTP)
 *                → Firebase token verified → tool.handler() → Jet Admin REST API
 *
 * Model strategy (Sept 2026):
 *   Primary: minimax/minimax-m3:free via OpenRouter (1M context, long-horizon
 *   agentic work, verified reliable tool_calls). Fallbacks tried in order on
 *   retryable errors (429 / 5xx / provider overload):
 *     nvidia/nemotron-3-ultra-550b-a55b:free → nvidia/nemotron-3-super-120b-a12b:free
 *     → z-ai/glm-5.2:free
 *
 * Config resolution (tenant wins, workspace fallback):
 *   1. Tenant vault `ai_config` credential (Tenant Settings → AI Configuration).
 *      Leave its API key empty to use the workspace key below.
 *   2. Workspace env: OPENROUTER_API_KEY / AI_BASE_URL / AI_MODEL.
 *   Only when neither exists do we return 403 AI_DISABLED.
 *
 * Auth: the user's Firebase Bearer token is forwarded through the MCP client's
 *   HTTP Authorization header into every tool call. Each tool runs under the
 *   calling user's own Casbin permissions — no shared service account.
 *
 * Session: the client owns message history and sends the full conversation on
 *   each request. The backend is stateless.
 *
 * Stream format: AI SDK UI stream, parsed natively by the frontend useChat hook.
 *
 * ESM/CJS boundary: ai, @ai-sdk/openai, @ai-sdk/mcp are ESM-only packages.
 *   We load them via await import() on first call (lazy singleton).
 */

const Logger = require('../../utils/logger');
const environment = require('../../environment');
const constants = require('../../constants');
const { z } = require('zod');

function hasUserConfirmedAction(messages, toolName, args) {
  if (!Array.isArray(messages)) return false;

  const matchesParams = (targetParams) => {
    const params = targetParams || {};
    for (const [key, value] of Object.entries(params)) {
      if (args[key] !== value) return false;
    }
    return true;
  };

  for (const msg of messages) {
    // Legacy v4 shape: top-level toolInvocations
    if (Array.isArray(msg.toolInvocations)) {
      for (const inv of msg.toolInvocations) {
        if (inv.toolName === 'askUser' && inv.state === 'result') {
          const askArgs = inv.args || {};
          const askResult = inv.result || {};
          if (
            askArgs.kind === 'confirm' &&
            askResult.confirmed === true &&
            askResult.targetTool === toolName &&
            matchesParams(askResult.targetParams)
          ) {
            return true;
          }
        }
      }
    }
    // v7 shape: tool-askUser part carrying its own result
    if (Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        const partName = part.type === 'dynamic-tool' ? part.toolName : (typeof part.type === 'string' && part.type.startsWith('tool-') ? part.type.slice(5) : null);
        if (partName !== 'askUser') continue;
        if (part.state !== 'output-available' && part.state !== 'output-error') continue;
        const askArgs = part.input || {};
        const askResult = part.output || {};
        if (
          askArgs.kind === 'confirm' &&
          askResult.confirmed === true &&
          askResult.targetTool === toolName &&
          matchesParams(askResult.targetParams)
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

// ─── Lazy SDK loader (ESM → CJS bridge) ──────────────────────────────────────

let _sdkLoaded = false;
let _streamText, _createOpenAI, _createGoogle, _createMCPClient, _convertToCoreMessages;
let _ToolLoopAgent, _createAgentUIStreamResponse, _stepCountIs;

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

  _ToolLoopAgent = aiMod.ToolLoopAgent;
  _createAgentUIStreamResponse = aiMod.createAgentUIStreamResponse;
  _stepCountIs = typeof aiMod.stepCountIs === 'function' ? aiMod.stepCountIs : null;
  _sdkLoaded = true;

  Logger.log('success', {
    message: 'ai.service:sdk:loaded',
    params: { model: environment.AI_MODEL || constants.AI.DEFAULT_MODEL },
  });
}

// ─── Config resolution ───────────────────────────────────────────────────────

/**
 * Resolve the effective AI config: tenant vault first, workspace env fallback.
 * Returns null when no usable API key exists anywhere.
 */
async function resolveAIConfig({ tenantID }) {
  const { vaultService } = require('../vault/vault.service');
  let tenantAiConfig = null;
  try {
    tenantAiConfig = await vaultService.getCredentialByProvider({ tenantID, provider: 'ai_config' });
  } catch (err) {
    Logger.log('warning', { message: 'ai.service:resolveAIConfig:tenantVaultMiss', params: { error: err.message } });
  }

  const hasTenantKey = !!(tenantAiConfig && tenantAiConfig.apiKey);
  const workspaceKey = environment.OPENROUTER_API_KEY || null;
  const workspaceBaseURL = environment.AI_BASE_URL || constants.AI.DEFAULT_BASE_URL;
  const workspaceModel = environment.AI_MODEL || constants.AI.DEFAULT_MODEL;

  if (hasTenantKey) {
    const provider = (tenantAiConfig.provider || 'openai').toLowerCase();
    return {
      provider,
      model: tenantAiConfig.model || workspaceModel,
      baseURL: tenantAiConfig.baseURL || (provider === 'google' ? undefined : workspaceBaseURL),
      apiKey: tenantAiConfig.apiKey,
      source: 'tenant',
      fallbackModels: [],
    };
  }

  if (workspaceKey) {
    return {
      provider: 'openrouter',
      model: workspaceModel,
      baseURL: workspaceBaseURL,
      apiKey: workspaceKey,
      source: 'workspace',
      fallbackModels:
        environment.AI_FALLBACK_MODELS && environment.AI_FALLBACK_MODELS.length > 0
          ? environment.AI_FALLBACK_MODELS
          : constants.AI.FALLBACK_MODELS || [],
    };
  }

  return null;
}

function isOpenRouterURL(baseURL) {
  return typeof baseURL === 'string' && baseURL.includes('openrouter.ai');
}

/**
 * Wrap fetch so SSE tool-call deltas always carry dense sequential indices.
 *
 * Root cause (seen live as `pumpError: Cannot read properties of undefined
 * (reading 'hasFinished')`): some OpenRouter-routed providers emit chat
 * deltas whose `tool_calls[].index` skips values (e.g. first delta has
 * index 1, or parallel calls numbered 0 and 2). The AI SDK accumulates
 * deltas in a plain array keyed by that index, so a skip leaves a hole and
 * its flush() crashes reading `hasFinished` of `undefined` — killing the
 * response stream mid-flight.
 *
 * The SDK only uses `index` to group deltas belonging to the same call, so
 * remapping provider indices → 0..n in order of first appearance is safe and
 * preserves parallel tool calls. Non-SSE responses pass through untouched.
 */
function createToolIndexNormalizingFetch(baseFetch) {
  const fetchFn = baseFetch || fetch;
  let remapLoggedFor = 0;

  return async (url, options) => {
    const res = await fetchFn(url, options);
    const contentType = (typeof res.headers?.get === 'function' ? res.headers.get('content-type') : '') || '';
    if (!contentType.includes('text/event-stream') || !res.body) return res;

    const indexMap = new Map();
    let nextIndex = 0;
    let remapped = 0;
    const dense = (i) => {
      if (i === null || i === undefined) return i;
      if (!indexMap.has(i)) indexMap.set(i, nextIndex++);
      const mapped = indexMap.get(i);
      if (mapped !== i) remapped++;
      return mapped;
    };

    const rewriteLine = (line) => {
      if (!line.startsWith('data:')) return line;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') return line;
      let json;
      try {
        json = JSON.parse(payload);
      } catch (_) {
        return line;
      }
      let touched = false;
      const choices = json && json.choices;
      if (Array.isArray(choices)) {
        for (const choice of choices) {
          const buckets = [choice && choice.delta && choice.delta.tool_calls, choice && choice.message && choice.message.tool_calls];
          for (const bucket of buckets) {
            if (Array.isArray(bucket)) {
              for (const tc of bucket) {
                if (tc && tc.index !== null && tc.index !== undefined) {
                  tc.index = dense(tc.index);
                  touched = true;
                }
              }
            }
          }
        }
      }
      return touched ? `data: ${JSON.stringify(json)}` : line;
    };

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let buffer = '';
    const stream = res.body.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          if (lines.length > 0) controller.enqueue(encoder.encode(`${lines.map(rewriteLine).join('\n')}\n`));
        },
        flush(controller) {
          buffer += decoder.decode();
          if (buffer) controller.enqueue(encoder.encode(rewriteLine(buffer)));
          buffer = '';
          if (remapped > 0 && Date.now() - remapLoggedFor > 60000) {
            remapLoggedFor = Date.now();
            Logger.log('info', {
              message: 'ai.service:toolIndexNormalized',
              params: { remappedDeltas: remapped, distinctCalls: indexMap.size },
            });
          }
        },
      }),
    );

    return new Response(stream, { status: res.status, statusText: res.statusText, headers: res.headers });
  };
}

function buildModelInstance({ provider, model, apiKey, baseURL }) {
  if (provider === 'google') {
    const googleProvider = _createGoogle({ apiKey });
    const isGoogleModel = model.includes('gemini') || model.includes('gemma');
    return googleProvider(isGoogleModel ? model : constants.AI.DEFAULT_MODEL);
  }

  // OpenAI-compatible (plain OpenAI + OpenRouter). OpenRouter needs its
  // analytics headers so requests are attributed to Jet Admin.
  const extraHeaders = {};
  if (isOpenRouterURL(baseURL)) {
    if (environment.OPENROUTER_HTTP_REFERER) extraHeaders['HTTP-Referer'] = environment.OPENROUTER_HTTP_REFERER;
    extraHeaders['X-Title'] = environment.OPENROUTER_APP_TITLE || constants.AI.OPENROUTER_APP_TITLE || 'Jet Admin';
  }
  const openaiProvider = _createOpenAI({
    baseURL,
    apiKey,
    compatibility: 'compatible',
    // Normalize sparse tool-call indices from routed providers before the
    // SDK's stream accumulator sees them (prevents mid-stream hasFinished crash).
    fetch: createToolIndexNormalizingFetch(fetch),
    ...(Object.keys(extraHeaders).length > 0 ? { headers: extraHeaders } : {}),
  });
  return openaiProvider.chat(model);
}

function isRetryableModelError(err) {
  const status = err?.status ?? err?.statusCode ?? err?.cause?.status;
  if (status === 429 || status === 502 || status === 503 || status === 529) return true;
  const msg = `${err?.message || ''} ${err?.code || ''}`.toLowerCase();
  return (
    msg.includes('rate-limit') ||
    msg.includes('rate limited') ||
    msg.includes('temporarily rate-limited') ||
    msg.includes('overloaded') ||
    msg.includes('provider returned error') ||
    msg.includes('service unavailable') ||
    msg.includes('timeout') ||
    msg.includes('fetch failed')
  );
}

// ─── History repair ──────────────────────────────────────────────────────────

function isToolUIPartLocal(p) {
  return !!p && typeof p.type === 'string' && (p.type === 'dynamic-tool' || p.type.startsWith('tool-'));
}

function getToolPartName(p) {
  if (!p || typeof p.type !== 'string') return null;
  if (p.type === 'dynamic-tool') return typeof p.toolName === 'string' ? p.toolName : null;
  if (p.type.startsWith('tool-')) {
    const name = p.type.slice(5);
    return name || null;
  }
  return null;
}

/**
 * Repair poisoned conversation history before it reaches the agent.
 *
 * Background: if a response stream ever dies mid-flight (network cut, provider
 * hiccup — e.g. the sparse-indices crash), the client keeps a partial
 * assistant message whose tool calls have no results. The SDK's prompt
 * converter hard-fails on those orphans with MissingToolResultsError, which
 * would brick the conversation forever since history is re-sent every turn.
 *
 * Repair policy per orphan tool part (state input-streaming/input-available):
 * - Client-side tool (no server `execute`, e.g. askUser): the question was
 *   abandoned — drop the part. The model re-asks if it still needs an answer.
 * - Known server-side tool: rewrite as an `output-error` result stating the
 *   previous attempt was interrupted and must be verified before retry. The
 *   agent sees a truthful failure and can check state + retry safely.
 * - Unknown tool name: drop (never send calls for tools that don't exist).
 *
 * Also converts legacy v4 `tool-invocation` parts into v7 `tool-*` parts
 * (result → output-available, call → orphan policy above) and drops anything
 * unconvertible, since v7 validation rejects the legacy shape outright.
 * Every message is guaranteed a string `id` (v7 validation requires it).
 *
 * This function is pure (returns a new array) and never invents success.
 */
function repairToolHistory(messages, tools) {
  const toolNames = new Set(Object.keys(tools || {}));
  const clientSide = new Set(
    Object.entries(tools || {})
      .filter(([, t]) => typeof (t && t.execute) !== 'function')
      .map(([name]) => name),
  );

  let droppedAbandoned = 0;
  let synthesizedErrors = 0;
  let convertedLegacy = 0;
  let droppedLegacy = 0;
  let droppedUnknown = 0;
  let idsAssigned = 0;

  const handleOrphan = (name, toolCallId, input, push) => {
    if (!name || !toolCallId || !toolNames.has(name)) {
      droppedUnknown++;
      return;
    }
    if (clientSide.has(name)) {
      droppedAbandoned++;
      return;
    }
    push({
      type: `tool-${name}`,
      toolCallId,
      state: 'output-error',
      ...(input !== undefined ? { input } : {}),
      errorText:
        'The previous attempt of this tool call was interrupted before a result arrived. ' +
        'First verify whether it already took effect (e.g. via get_tenant_resource_summary or the matching get_* tool); ' +
        'only retry with the same arguments if it did not.',
    });
    synthesizedErrors++;
  };

  const repaired = (Array.isArray(messages) ? messages : []).map((msg, idx) => {
    if (!msg || typeof msg !== 'object') return msg;
    const clean = { ...msg };
    if (typeof clean.id !== 'string' || clean.id.length === 0) {
      clean.id = `msg-repaired-${idx}-${Date.now().toString(36)}`;
      idsAssigned++;
    }
    if (!Array.isArray(clean.parts)) return clean;

    const newParts = [];
    for (const part of clean.parts) {
      // Legacy v4 shape → v7
      if (part && part.type === 'tool-invocation') {
        const inv = part.toolInvocation;
        const name = inv && inv.toolName;
        const toolCallId = inv && (inv.toolCallId || inv.id);
        if (!inv || !name || !toolCallId) {
          droppedLegacy++;
          continue;
        }
        if (inv.state === 'result') {
          newParts.push({
            type: `tool-${name}`,
            toolCallId,
            state: 'output-available',
            input: inv.args !== undefined ? inv.args : {},
            output: inv.result !== undefined ? inv.result : null,
          });
          convertedLegacy++;
        } else {
          // Orphaned legacy call (stream died before a result) — same policy
          // as v7 orphans; accounted for in those same counters.
          handleOrphan(name, toolCallId, inv.args, (p) => newParts.push(p));
        }
        continue;
      }

      if (!isToolUIPartLocal(part)) {
        newParts.push(part);
        continue;
      }

      const state = part.state;
      if (state === 'input-streaming' || state === 'input-available') {
        handleOrphan(getToolPartName(part), part.toolCallId, part.input, (p) => {
          // Preserve dynamic-tool shape (requires toolName); rebuild static shape cleanly.
          if (part.type === 'dynamic-tool') p = { ...p, type: 'dynamic-tool', toolName: part.toolName };
          newParts.push(p);
        });
        continue;
      }

      newParts.push(part);
    }
    clean.parts = newParts;
    // Legacy top-level key is fully represented in parts now; v7 ignores it,
    // so drop it to keep the payload clean.
    if (Array.isArray(clean.toolInvocations)) delete clean.toolInvocations;
    return clean;
  });

  const touched = droppedAbandoned + synthesizedErrors + convertedLegacy + droppedLegacy + droppedUnknown + idsAssigned;
  if (touched > 0) {
    Logger.log('info', {
      message: 'ai.service:historyRepaired',
      params: { droppedAbandoned, synthesizedErrors, convertedLegacy, droppedLegacy, droppedUnknown, idsAssigned },
    });
  }
  return repaired;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const { aiContextService } = require('./ai.context.service');
const { aiSystemPrompt } = require('./ai.systemPrompt');

const aiService = {};

/**
 * Stream a chat response using the Vercel AI SDK agent loop.
 *
 * Accepts the full message history from the client (useChat pattern).
 * Uses @ai-sdk/mcp to call tools on the standalone MCP server, which
 * validates the Bearer token and enforces Casbin permissions on each call.
 *
 * @param {object} param0
 * @param {Array}  param0.messages     - Full conversation history (AI SDK UIMessage[])
 * @param {string} param0.tenantID     - Current tenant UUID
 * @param {string} param0.bearerToken  - Firebase JWT for this user
 * @param {object} param0.clientContext- Client location (route, widgetID, appPageID)
 * @param {string} param0.conversationID - Conversation ID for context caching
 * @param {object} param0.res          - Express ServerResponse
 */
aiService.streamChat = async ({ messages, tenantID, bearerToken, clientContext, conversationID, res }) => {
  const startedAt = Date.now();
  try {
    await loadSDK();
  } catch (err) {
    Logger.log('error', { message: 'ai.service:streamChat:sdkLoadFailed', params: { error: err.message } });
    res.status(500).json({ error: 'AI engine failed to load. Please retry.', code: 'AI_SDK_LOAD_FAILED' });
    return;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array cannot be empty.', code: 'AI_EMPTY_MESSAGES' });
    return;
  }

  const aiConfig = await resolveAIConfig({ tenantID });
  if (!aiConfig) {
    Logger.log('warning', { message: 'ai.service:streamChat:noApiKeyAnywhere', params: { tenantID } });
    res.status(403).json({
      error: 'Jet AI is not configured yet. Ask a workspace admin to set OPENROUTER_API_KEY on the backend, or configure a key in Tenant Settings → AI Configuration.',
      code: 'AI_DISABLED',
    });
    return;
  }

  const { provider: aiProvider, model: rawModel, baseURL: aiBaseUrl, apiKey: aiApiKey, source: configSource } = aiConfig;
  const candidateModels = [rawModel, ...(aiConfig.fallbackModels || [])].filter(Boolean);
  const maxSteps = environment.AI_MAX_STEPS || constants.AI.MAX_STEPS || 25;

  // Create an MCP client pointed at our standalone MCP server.
  // The Bearer token is forwarded so tool calls run under this user's identity.
  const mcpServerUrl = `${environment.MCP_SERVER_URL}/tenants/${tenantID}/mcp`;
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
    res.status(503).json({ error: 'Jet AI tools are unreachable (MCP server). Please retry in a moment.', code: 'AI_TOOLS_UNAVAILABLE' });
    return;
  }

  // Discover available tools from the MCP server
  let tools = {};
  try {
    tools = await mcpClient.tools();
  } catch (err) {
    Logger.log('error', { message: 'ai.service:streamChat:toolDiscoveryFailed', params: { tenantID, error: err.message } });
    try { await mcpClient.close(); } catch (_) { /* ignore */ }
    res.status(503).json({ error: 'Jet AI tools failed to load. Please retry.', code: 'AI_TOOLS_UNAVAILABLE' });
    return;
  }

  // Sanitize UI messages to strictly conform to AI SDK UIMessage validation.
  // The frontend useChat sometimes passes internal part types (e.g. step-start, dynamic-tool)
  // that the strict Zod validation in createAgentUIStreamResponse rejects.
  // NOTE: declared with `let` — repaired in place (history repair) once the
  // final tool set is known, so the confirmation gate and the agent see the
  // same message list.
  let sanitizedMessages = messages.map((m) => {
    const cleanMsg = { ...m };

    // 1. Extract tool invocations from custom parts if not already present
    if (!cleanMsg.toolInvocations && Array.isArray(cleanMsg.parts)) {
      const extractedTools = [];
      cleanMsg.parts.forEach((p) => {
        if (p.type === 'tool-invocation' && p.toolInvocation) {
          extractedTools.push(p.toolInvocation);
        } else if (p.toolCallId || p.type?.includes('tool')) {
          extractedTools.push({
            state: (p.state === 'output-available' || p.output !== undefined || p.result !== undefined) ? 'result' : 'call',
            toolCallId: p.toolCallId || p.id,
            toolName: p.toolName || p.name || 'tool',
            args: p.input || p.args || {},
            result: p.output !== undefined ? p.output : p.result,
          });
        }
      });
      if (extractedTools.length > 0) {
        cleanMsg.toolInvocations = extractedTools;
      }
    }

    // 2. Filter parts to only allow strictly valid AI SDK UIMessage parts
    if (!Array.isArray(cleanMsg.parts)) {
      cleanMsg.parts = [];
      if (cleanMsg.content) {
        cleanMsg.parts.push({ type: 'text', text: cleanMsg.content });
      }
    } else {
      cleanMsg.parts = cleanMsg.parts.filter((p) =>
        p.type === 'text' ||
        p.type === 'reasoning' ||
        p.type === 'tool-invocation' ||
        p.type === 'dynamic-tool' ||
        p.type === 'step-start' ||
        p.type === 'file' ||
        p.type === 'reasoning-file' ||
        p.type === 'custom' ||
        (typeof p.type === 'string' && (p.type.startsWith('tool-') || p.type.startsWith('data-')))
      );
      // If parts is empty after filtering, ensure it has at least the text content if available
      if (cleanMsg.parts.length === 0 && cleanMsg.content) {
        cleanMsg.parts.push({ type: 'text', text: cleanMsg.content });
      }
    }

    return cleanMsg;
  });

  Logger.log('info', {
    message: 'ai.service:streamChat:start',
    params: { tenantID, messageCount: sanitizedMessages.length, model: rawModel, source: configSource, toolCount: Object.keys(tools).length },
  });

  const localizedContextBlock = await aiContextService.buildSessionContext({ tenantID, conversationID, clientContext });
  const dynamicSystemPrompt = aiSystemPrompt.build(localizedContextBlock);

  // Critical operations that must go through confirmation
  const criticalTools = [
    'create_datasource',
    'update_datasource',
    'delete_datasource',
    'create_query',
    'update_query',
    'delete_query',
    'create_widget',
    'update_widget',
    'delete_widget',
    'create_app_page',
    'update_app_page',
    'delete_app_page',
    'create_workflow',
    'update_workflow',
    'delete_workflow',
    'execute_workflow',
    'create_listener',
    'update_listener',
    'delete_listener',
    'activate_listener',
    'deactivate_listener'
  ];

  const processedTools = {};

  // Wrap MCP tools to intercept critical actions
  for (const [name, tool] of Object.entries(tools)) {
    if (criticalTools.includes(name)) {
      const originalExecute = tool.execute;
      processedTools[name] = {
        ...tool,
        execute: async (args, context) => {
          if (!hasUserConfirmedAction(sanitizedMessages, name, args)) {
            return {
              error: 'CONFIRMATION_REQUIRED',
              message: `Confirmation required. You must call 'askUser' with kind='confirm' to get the user's explicit confirmation before running '${name}'.`,
              targetTool: name,
              targetParams: args
            };
          }
          return originalExecute(args, context);
        }
      };
    } else {
      processedTools[name] = tool;
    }
  }

  // Add client-side elicitation and planning tools
  processedTools.askUser = {
    description: 'Ask the user a clarifying question before proceeding, when a required parameter is ambiguous or a critical action needs confirmation. Ask ONE focused question per call (2-4 short options max).',
    parameters: z.object({
      kind: z.enum(['form', 'choice', 'confirm']),
      title: z.string().describe('Concise title for the prompt widget'),
      description: z.string().optional().describe('Helpful context explaining what is being asked or warned about'),
      fields: z.array(
        z.object({
          name: z.string().describe('Input identifier key'),
          label: z.string().describe('Input display label'),
          type: z.enum(['text', 'number', 'select', 'boolean', 'secret', 'textarea']),
          defaultValue: z.any().optional(),
          options: z.array(z.string()).optional(),
        })
      ).optional().describe("Form input fields if kind is 'form'"),
      choices: z.array(
        z.object({
          label: z.string().describe('Short choice label'),
          description: z.string().optional().describe('Detailed description of this choice'),
          value: z.string().describe('Value returned to the agent loop if chosen'),
        })
      ).optional().describe("Multi-choice options if kind is 'choice'"),
      targetTool: z.string().optional().describe("If confirm, the tool name being confirmed"),
      targetParams: z.record(z.any()).optional().describe('If confirm, the tool parameters being confirmed'),
    }),
  };

  const planStepSchema = z.object({
    id: z.string().describe('Stable step id, e.g. step-1'),
    title: z.string().describe('Short checklist item title'),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  });

  processedTools.createPlan = {
    description: 'Initialize a plan tracker with a checklist of steps BEFORE executing complex or multi-step operations (3+ tool calls or a datasource→query→widget→page chain). Call once per task.',
    parameters: z.object({
      title: z.string().describe('Overall objective of the plan'),
      steps: z.array(planStepSchema).min(2).max(12),
    }),
    execute: async (args) => {
      return { success: true, plan: args };
    }
  };

  processedTools.updatePlan = {
    description: 'Update the plan checklist as work progresses: mark the current step in_progress when starting it, completed/failed when done. Call after each major tool result so the UI progress stays truthful.',
    parameters: z.object({
      title: z.string().optional().describe('Overall objective (echo back the plan title)'),
      steps: z.array(planStepSchema).min(2).max(12),
    }),
    execute: async (args) => {
      return { success: true, plan: args };
    }
  };

  // Repair poisoned history (orphaned tool calls from previously interrupted
  // streams, legacy part shapes, missing ids) so one dead stream can never
  // brick the conversation with MissingToolResultsError.
  sanitizedMessages = repairToolHistory(sanitizedMessages, processedTools);

  // ── Model attempts with fallback ──────────────────────────────────────────
  const modelsTried = [];
  let webResponse = null;
  let activeModel = null;
  let lastModelError = null;

  for (const candidate of candidateModels) {
    let modelInstance;
    try {
      modelInstance = buildModelInstance({ provider: aiProvider, model: candidate, apiKey: aiApiKey, baseURL: aiBaseUrl });
    } catch (err) {
      lastModelError = err;
      modelsTried.push(`${candidate} (build failed)`);
      continue;
    }

    const agentOptions = {
      model: modelInstance,
      instructions: dynamicSystemPrompt,
      tools: processedTools,
      // Replace the SDK's default raw console.error dump with one clean log
      // line. The error itself still streams to the client as an SSE error
      // part, so the chat panel shows it in the error banner.
      onError: ({ error }) => {
        Logger.log('error', {
          message: 'ai.service:streamChat:agentError',
          params: {
            tenantID,
            model: candidate,
            error: (error && error.message) || String(error),
            toolCallIds: (error && error.toolCallIds) || undefined,
          },
        });
      },
      onEnd: async ({ usage, steps }) => {
        Logger.log('success', {
          message: 'ai.service:streamChat:done',
          params: {
            tenantID,
            model: candidate,
            source: configSource,
            totalTokens: usage?.totalTokens,
            totalSteps: steps?.length,
            durationMs: Date.now() - startedAt,
          },
        });
        try {
          await mcpClient.close();
        } catch (_) {
          // Ignore cleanup errors
        }
      },
    };
    if (_stepCountIs) {
      try {
        agentOptions.stopWhen = _stepCountIs(maxSteps);
      } catch (_) {
        // Older SDK without stopWhen support — the loop still terminates on its own.
      }
    }

    try {
      const agent = new _ToolLoopAgent(agentOptions);
      // eslint-disable-next-line no-await-in-loop
      webResponse = await _createAgentUIStreamResponse({ agent, uiMessages: sanitizedMessages });
      activeModel = candidate;
      modelsTried.push(candidate);
      break;
    } catch (err) {
      lastModelError = err;
      modelsTried.push(`${candidate} (${err?.message || 'failed'})`);
      Logger.log('warning', {
        message: 'ai.service:streamChat:modelAttemptFailed',
        params: { tenantID, model: candidate, error: err?.message },
      });
      if (!isRetryableModelError(err)) break;
      // otherwise fall through to the next candidate
    }
  }

  if (!webResponse) {
    try { await mcpClient.close(); } catch (_) { /* ignore */ }
    const rateLimited = lastModelError && isRetryableModelError(lastModelError);
    Logger.log('error', {
      message: 'ai.service:streamChat:allModelsFailed',
      params: { tenantID, modelsTried, error: lastModelError?.message },
    });
    res.status(rateLimited ? 429 : 502).json({
      error: rateLimited
        ? 'The free Jet AI model is rate-limited right now. Please wait a minute and retry — your chat history is preserved.'
        : `Jet AI could not generate a response (${lastModelError?.message || 'model error'}). Please retry.`,
      code: rateLimited ? 'AI_RATE_LIMITED' : 'AI_MODEL_FAILED',
      modelsTried,
    });
    return;
  }

  Logger.log('info', {
    message: 'ai.service:streamChat:streaming',
    params: { tenantID, model: activeModel, source: configSource },
  });

  res.status(webResponse.status);
  webResponse.headers.forEach((val, key) => res.setHeader(key, val));

  const reader = webResponse.body.getReader();
  const pump = async () => {
    try {
      while (true) {
        if (res.destroyed || res.writableEnded) break;
        const { done, value } = await reader.read();
        if (done) break;
        if (res.destroyed || res.writableEnded) break;
        res.write(value);
      }
    } finally {
      try {
        reader.releaseLock();
      } catch (_) {
        // Stream already closed — nothing to release.
      }
      if (!res.destroyed && !res.writableEnded) res.end();
    }
  };

  pump().catch((err) => {
    Logger.log('error', { message: 'ai.service:streamChat:pumpError', params: { error: err.message } });
    try {
      reader.cancel().catch(() => {});
    } catch (_) {
      // Ignore cleanup errors
    }
    try {
      if (!res.destroyed && !res.writableEnded) res.end();
    } catch (_) {
      // Client already gone
    }
  });
};

module.exports = { aiService, resolveAIConfig, isRetryableModelError, createToolIndexNormalizingFetch, repairToolHistory, hasUserConfirmedAction };
