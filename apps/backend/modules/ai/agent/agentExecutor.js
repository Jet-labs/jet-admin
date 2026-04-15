/**
 * AgentExecutor — Core ReAct loop
 * 
 * Orchestrates the agent cycle using OpenAI SDK (connecting to OpenRouter):
 * 1. Send user message + tools to OpenAI/OpenRouter
 * 2. If model returns tool calls → execute them
 * 3. If a tool PAUSES (approval needed) → save state, emit to client, return
 * 4. On resume (user approved) → re-enter loop with approval result appended as tool response
 * 5. If model returns text → done, emit final response
 */

const { OpenAI } = require('openai');
const Logger = require("../../../utils/logger");
const environmentVariables = require('../../../environment');
const { agentSession } = require('./agentSession');
const { AGENT_TOOL_DECLARATIONS, TOOL_NAMES } = require('./agentTools');
const { datasourceDiscovery } = require('./datasourceDiscovery');
const { queryConceptualizer } = require('./queryConceptualizer');
const { v4: uuid } = require('uuid');

// Tools that PAUSE the agent and wait for user approval
const PAUSING_TOOLS = [
  TOOL_NAMES.REQUEST_DATASOURCE_APPROVAL,
  TOOL_NAMES.REQUEST_QUERY_APPROVAL,
];

/**
 * Build the system instruction for the agent
 */
function buildSystemInstruction(availableDatasources) {
  const dsListStr = availableDatasources
    .map(ds => `- [${ds.datasourceID}] "${ds.datasourceTitle}" (${ds.datasourceType}) tags: [${ds.datasourceTags.join(', ')}]`)
    .join('\n');

  return `You are Jet, an AI data analyst for Jet-Admin. 
Your goal is to answer user questions by using the provided tools to fetch data from their datasources, analyze it, and present insights.

## Available Datasources
${dsListStr}

## Protocol
1. Use getDatasourceInfo to understand the schema of a datasource before querying it.
2. You must call requestDatasourceApproval before you are allowed to draft or run any queries.
3. Once approved, use draftQuery to prepare queries.
4. Call requestQueryApproval to show your plan to the user.
5. After execution, use selectVisualization and synthesizeResponse to provide the final analysis.

Be professional, concise, and always explain your reasoning before calling a tool.`;
}

/**
 * Execute one turn of the ReAct loop.
 * Returns when: (a) a pausing tool is called, or (b) the model returns text.
 */
async function executeTurn({ chatRoomID, socketEmit }) {
  const session = agentSession.get(chatRoomID);
  if (!session) throw new Error('Session not found');

  const openai = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: environmentVariables.GROQ_API_KEY,
  });

  // Ensure system instruction is the very first message
  if (session.messageHistory.length === 0 || session.messageHistory[0].role !== 'system') {
    session.messageHistory.unshift({
      role: 'system',
      content: buildSystemInstruction(session.discoveredDatasources)
    });
  }

  // Maximum iterations to prevent infinite loops
  const MAX_ITERATIONS = 15;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    Logger.log('info', {
      message: 'agentExecutor:turn:iteration',
      params: { chatRoomID, iteration: i, state: session.state },
    });

    try {
      const response = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: session.messageHistory,
        tools: AGENT_TOOL_DECLARATIONS,
        tool_choice: 'auto',
        max_tokens: 4096,
      });

      const choice = response.choices[0];
      const message = choice.message;

      // Ensure we append the assistant's message to the history, including any tool_calls.
      agentSession.appendMessage(chatRoomID, message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        // Execute each nested function call
        for (const toolCall of message.tool_calls) {
          const name = toolCall.function.name;
          // Safely parse args with fallback
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch(e) { /* ignore parse error for empty args */ }

          Logger.log('info', {
            message: 'agentExecutor:toolCall',
            params: { chatRoomID, tool: name },
          });

          // Check if this is a pausing tool
          if (PAUSING_TOOLS.includes(name)) {
            session.pendingToolCallId = toolCall.id; // Store pending ID for resuming
            const pauseResult = await handlePausingTool({
              session,
              toolName: name,
              args,
              socketEmit,
            });
            return pauseResult;
          }

          // Execute non-pausing tool
          const toolResult = await executeToolCall({
            session,
            toolName: name,
            args,
            socketEmit,
          });

          // Save function response as 'tool' to history
          agentSession.appendMessage(chatRoomID, {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Loop continues, openai.chat.completions.create is called again with the tool responses
        continue;
      }

      // No tool calls means the model returned text — final response
      Logger.log('info', {
        message: 'agentExecutor:turn:textResponse',
        params: { chatRoomID },
      });

      return {
        type: 'text',
        text: message.content,
      };

    } catch (error) {
       // Detailed logging for Groq API errors
       const failedGeneration = error.error && error.error.error && error.error.error.failed_generation;
       
       Logger.log('error', {
        message: 'agentExecutor:turn:error',
        params: { 
          chatRoomID, 
          error: error.message,
          failed_generation: failedGeneration || 'N/A'
        },
      });
      return { type: 'error', error: 'Agent encountered an API error: ' + error.message };
    }
  }

  return { type: 'error', error: 'Agent exceeded maximum iterations' };
}

/**
 * Execute a non-pausing tool call
 */
async function executeToolCall({ session, toolName, args, socketEmit }) {
  switch (toolName) {
    case TOOL_NAMES.GET_DATASOURCE_INFO: {
      socketEmit('agent:thinking', {
        chatRoomID: session.chatRoomID,
        message: `Inspecting datasource: ${args.datasourceID}`,
      });

      const manifest = await datasourceDiscovery.getManifestForDatasource({
        datasourceID: args.datasourceID,
        tenantID: session.tenantID,
        userID: session.userID,
        session,
      });
      return manifest;
    }

    case TOOL_NAMES.DRAFT_QUERY: {
      const query = {
        id: uuid(),
        title: args.queryTitle,
        datasourceID: args.datasourceID,
        datasourceType: session.datasourceManifests[args.datasourceID]?.datasourceType || 'unknown',
        dataQueryOptions: args.dataQueryOptions,
        humanReadableDescription: args.humanReadableDescription,
        detectedParameters: args.detectedParameters || [],
        resolvedArgValues: {},
      };

      const currentQueries = session.conceptualizedQueries || [];
      agentSession.update(session.chatRoomID, {
        conceptualizedQueries: [...currentQueries, query],
      });

      socketEmit('agent:thinking', {
        chatRoomID: session.chatRoomID,
        message: `Drafted query: ${query.title}`,
      });

      return {
        success: true,
        queryId: query.id,
        queryTitle: query.title,
        message: 'Query drafted and stored. Call requestQueryApproval when all queries are ready.',
      };
    }

    case TOOL_NAMES.SELECT_VISUALIZATION: {
      agentSession.update(session.chatRoomID, {
        selectedVizType: args.vizType,
        vizConfig: {
          xAxisKey: args.xAxisKey,
          yAxisKeys: args.yAxisKeys,
          kpiMetrics: args.kpiMetrics,
          reasoning: args.reasoning,
        },
      });

      return {
        success: true,
        vizType: args.vizType,
        message: 'Visualization type selected.',
      };
    }

    case TOOL_NAMES.SYNTHESIZE_RESPONSE: {
      agentSession.update(session.chatRoomID, {
        narrativeSummary: args.narrative,
        keyMetrics: args.keyMetrics,
        suggestedFollowUps: args.suggestedFollowUps,
      });
      agentSession.transition(session.chatRoomID, 'responding');

      return {
        success: true,
        message: 'Response synthesized. Now return the final response to the user.',
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Handle tools that pause the agent (need user approval)
 */
async function handlePausingTool({ session, toolName, args, socketEmit }) {
  switch (toolName) {
    case TOOL_NAMES.REQUEST_DATASOURCE_APPROVAL: {
      agentSession.transition(session.chatRoomID, 'awaiting_ds_approval');

      socketEmit('agent:approval_required', {
        chatRoomID: session.chatRoomID,
        type: 'datasource_approval',
        selectedDatasources: args.selectedDatasources,
        planSummary: args.planSummary,
      });

      return {
        type: 'paused',
        reason: 'awaiting_ds_approval',
        data: args,
      };
    }

    case TOOL_NAMES.REQUEST_QUERY_APPROVAL: {
      agentSession.transition(session.chatRoomID, 'awaiting_query_approval');

      socketEmit('agent:approval_required', {
        chatRoomID: session.chatRoomID,
        type: 'query_approval',
        queries: session.conceptualizedQueries.map(q => ({
          id: q.id,
          title: q.title,
          datasourceID: q.datasourceID,
          humanReadableDescription: q.humanReadableDescription,
          dataQueryOptions: q.dataQueryOptions,
          detectedParameters: q.detectedParameters,
        })),
        querySummary: args.querySummary,
      });

      return {
        type: 'paused',
        reason: 'awaiting_query_approval',
        data: args,
      };
    }

    default:
      return { type: 'error', error: `Unknown pausing tool: ${toolName}` };
  }
}

/**
 * Resume the agent after user approval
 */
async function resumeAfterApproval({ chatRoomID, approvalType, approvalData, socketEmit }) {
  const session = agentSession.get(chatRoomID);
  if (!session) throw new Error('Session not found');

  const pendingToolCallId = session.pendingToolCallId;

  Logger.log('info', {
    message: 'agentExecutor:resume',
    params: { chatRoomID, approvalType, pendingToolCallId },
  });

  if (approvalType === 'datasource_approval') {
    // Store approved datasource IDs
    agentSession.update(chatRoomID, {
      approvedDatasourceIDs: approvalData.approvedIDs || [],
      pendingToolCallId: null,
    });
    agentSession.transition(chatRoomID, 'conceptualizing');

    // Add tool response to history matching the ID
    agentSession.appendMessage(chatRoomID, {
      role: 'tool',
      tool_call_id: pendingToolCallId,
      content: JSON.stringify({
        approved: true,
        approvedDatasourceIDs: approvalData.approvedIDs,
        message: 'User approved these datasources. You may now draft queries.',
      }),
    });

    // Continue the ReAct loop
    return executeTurn({ chatRoomID, socketEmit });
  }

  if (approvalType === 'query_approval') {
    agentSession.transition(chatRoomID, 'executing');
    agentSession.update(chatRoomID, { pendingToolCallId: null });

    socketEmit('agent:thinking', {
      chatRoomID,
      message: 'Executing approved queries...',
    });

    // Execute all approved queries
    const results = await queryConceptualizer.executeAllQueries({
      chatRoomID,
      tenantID: session.tenantID,
      userID: session.userID,
    });

    // Add tool response with query results to history
    agentSession.appendMessage(chatRoomID, {
      role: 'tool',
      tool_call_id: pendingToolCallId,
      content: JSON.stringify({
        approved: true,
        queryResults: Object.entries(results).map(([queryId, result]) => ({
          queryId,
          queryTitle: result.queryTitle,
          success: result.success,
          rowCount: result.rowCount,
          executionMs: result.executionMs,
          // Send sample of data to keep context window manageable
          sampleData: result.data?.slice(0, 50),
          totalRows: result.rowCount,
          error: result.error || null,
        })),
        message: 'Queries executed. Analyze the results and select a visualization.',
      }),
    });

    // Continue the ReAct loop
    return executeTurn({ chatRoomID, socketEmit });
  }

  throw new Error(`Unknown approval type: ${approvalType}`);
}

module.exports = { executeTurn, resumeAfterApproval };
