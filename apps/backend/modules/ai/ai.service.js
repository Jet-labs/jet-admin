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
const { z } = require('zod');

function hasUserConfirmedAction(messages, toolName, args) {
  if (!Array.isArray(messages)) return false;
  
  for (const msg of messages) {
    if (Array.isArray(msg.toolInvocations)) {
      for (const inv of msg.toolInvocations) {
        if (inv.toolName === 'askUser' && inv.state === 'result') {
          const askArgs = inv.args || {};
          const askResult = inv.result || {};
          if (
            askArgs.kind === 'confirm' &&
            askResult.confirmed === true &&
            askResult.targetTool === toolName
          ) {
            // Check if all parameters from args match targetParams
            const targetParams = askResult.targetParams || {};
            let isMatch = true;
            for (const [key, value] of Object.entries(targetParams)) {
              if (args[key] !== value) {
                isMatch = false;
                break;
              }
            }
            if (isMatch) return true;
          }
        }
      }
    }
  }
  return false;
}

// ─── Lazy SDK loader (ESM → CJS bridge) ──────────────────────────────────────

let _sdkLoaded = false;
let _streamText, _createOpenAI, _createGoogle, _createMCPClient, _convertToCoreMessages;
let _ToolLoopAgent, _createAgentUIStreamResponse;

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
  _sdkLoaded = true;

  Logger.log('success', {
    message: 'ai.service:sdk:loaded',
    params: { model: environment.AI_MODEL || constants.AI.DEFAULT_MODEL },
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

const { aiContextService } = require('./ai.context.service');
const { aiSystemPrompt } = require('./ai.systemPrompt');

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
 * @param {object} param0.clientContext- Client location (route, widgetID, appPageID)
 * @param {string} param0.conversationID - Conversation ID for context caching
 * @param {object} param0.res          - Express ServerResponse
 */
aiService.streamChat = async ({ messages, tenantID, bearerToken, clientContext, conversationID, res }) => {
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
    res.status(503).json({ error: 'Failed to connect to MCP server' });
    return;
  }

  // Discover available tools from the MCP server
  const tools = await mcpClient.tools();

  // Sanitize UI messages to strictly conform to AI SDK UIMessage validation.
  // The frontend useChat sometimes passes internal part types (e.g. step-start, dynamic-tool)
  // that the strict Zod validation in createAgentUIStreamResponse rejects.
  const sanitizedMessages = messages.map((m) => {
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
    params: { tenantID, messageCount: sanitizedMessages.length, model: rawModel },
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
              error: "CONFIRMATION_REQUIRED",
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
    description: "Ask the user a clarifying question before proceeding, when a required parameter is ambiguous or critical action needs confirmation.",
    parameters: z.object({
      kind: z.enum(["form", "choice", "confirm"]),
      title: z.string().describe("Concise title for the prompt widget"),
      description: z.string().optional().describe("Helpful context explaining what is being asked or warned about"),
      fields: z.array(
        z.object({
          name: z.string().describe("Input identifier key"),
          label: z.string().describe("Input display label"),
          type: z.enum(["text", "number", "select", "boolean", "secret", "textarea"]),
          defaultValue: z.any().optional(),
          options: z.array(z.string()).optional(),
        })
      ).optional().describe("Form input fields if kind is 'form'"),
      choices: z.array(
        z.object({
          label: z.string().describe("Short choice label"),
          description: z.string().optional().describe("Detailed description of this choice"),
          value: z.string().describe("Value returned to the agent loop if chosen"),
        })
      ).optional().describe("Multi-choice options if kind is 'choice'"),
      targetTool: z.string().optional().describe("If confirm, the tool name being confirmed"),
      targetParams: z.record(z.any()).optional().describe("If confirm, the tool parameters being confirmed"),
    }),
  };

  processedTools.createPlan = {
    description: "Initialize a plan tracker with a checklist of steps before executing complex or multi-step operations.",
    parameters: z.object({
      title: z.string().describe("Overall objective of the plan"),
      steps: z.array(
        z.object({
          id: z.string().describe("Unique ID for the step"),
          title: z.string().describe("Short checklist item title"),
          status: z.enum(["pending", "in_progress", "completed", "failed"]),
        })
      ),
    }),
    execute: async (args) => {
      return { success: true, plan: args };
    }
  };

  const agent = new _ToolLoopAgent({
    model: modelInstance,
    instructions: dynamicSystemPrompt,
    tools: processedTools,
    onEnd: async ({ usage, steps }) => {
      Logger.log('success', {
        message: 'ai.service:streamChat:done',
        params: { tenantID, totalTokens: usage?.totalTokens, totalSteps: steps?.length },
      });
      try {
        await mcpClient.close();
      } catch (_) {
        // Ignore cleanup errors
      }
    },
  });

  const webResponse = await _createAgentUIStreamResponse({
    agent,
    uiMessages: sanitizedMessages,
  });

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
    Logger.log('error', { message: 'ai.service:streamChat:pumpError', params: { error: err.message } });
    res.end();
  });
};

module.exports = { aiService };
