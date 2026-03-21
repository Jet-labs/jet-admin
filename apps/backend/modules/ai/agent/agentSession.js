const Logger = require('../../../utils/logger');

/**
 * In-memory session store for agent conversations.
 * Keyed by chatRoomID. Each session persists for the duration of 
 * one agentic conversation including multi-step approvals.
 * 
 * Pattern mirrors widgetWorkflowBridge.js widgetConnections Map.
 */
const sessions = new Map();

// Auto-cleanup sessions older than 2 hours
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [chatRoomID, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(chatRoomID);
      Logger.log('info', {
        message: 'agentSession:cleanup:expired',
        params: { chatRoomID },
      });
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

const agentSession = {

  /**
   * Create a new session for a chat room
   */
  create({ chatRoomID, tenantID, userID, originalQuery }) {
    const session = {
      chatRoomID,
      tenantID,
      userID,
      originalQuery,
      // OpenAI multi-turn message history
      // Format: [{ role: 'user'|'assistant'|'system'|'tool', content: '...', tool_calls: [...], tool_call_id: '...' }]
      messageHistory: [],
      // Agent state machine
      state: 'idle',
      // Available datasource IDs for this tenant
      availableDatasourceIDs: [],
      // Populated after datasource discovery
      discoveredDatasources: [], // [{ datasourceID, datasourceTitle, datasourceType, manifest }]
      approvedDatasourceIDs: [],
      datasourceManifests: {}, // { datasourceID: enrichedManifest }
      // Populated after query conceptualization
      conceptualizedQueries: [], // [ConceptualizedQuery]
      // Populated after query execution
      queryResults: {}, // { queryId: { data: [], rowCount: int, executionMs: int } }
      // Final response state
      selectedVizType: null,
      vizConfig: null,
      narrativeSummary: null,
      keyMetrics: null,
      suggestedFollowUps: null,
      // Widget promotion state
      promotedWidgetID: null,
      // Timestamps
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };

    sessions.set(chatRoomID, session);
    Logger.log('info', {
      message: 'agentSession:created',
      params: { chatRoomID, tenantID, userID },
    });
    return session;
  },

  /**
   * Get an existing session
   */
  get(chatRoomID) {
    const session = sessions.get(chatRoomID);
    if (session) {
      session.lastActivityAt = Date.now();
    }
    return session || null;
  },

  /**
   * Update session fields
   */
  update(chatRoomID, updates) {
    const session = sessions.get(chatRoomID);
    if (!session) {
      Logger.log('error', {
        message: 'agentSession:update:notFound',
        params: { chatRoomID },
      });
      return null;
    }
    Object.assign(session, updates, { lastActivityAt: Date.now() });
    return session;
  },

  /**
   * Append a message to the OpenAI conversation history
   */
  appendMessage(chatRoomID, message) {
    const session = sessions.get(chatRoomID);
    if (!session) return;
    session.messageHistory.push(message);
    session.lastActivityAt = Date.now();
  },

  /**
   * Transition session state machine
   * Valid transitions enforced here to catch bugs early
   */
  transition(chatRoomID, newState) {
    const validTransitions = {
      idle: ['discovering'],
      discovering: ['awaiting_ds_approval'],
      awaiting_ds_approval: ['conceptualizing', 'idle'], // idle = user cancelled
      conceptualizing: ['awaiting_query_approval'],
      awaiting_query_approval: ['executing', 'idle'],
      executing: ['responding'],
      responding: ['done'],
      done: ['idle'], // reset for follow-up question
    };

    const session = sessions.get(chatRoomID);
    if (!session) return null;

    const allowed = validTransitions[session.state] || [];
    if (!allowed.includes(newState)) {
      Logger.log('error', {
        message: 'agentSession:invalidTransition',
        params: { chatRoomID, from: session.state, to: newState },
      });
      return null;
    }

    session.state = newState;
    session.lastActivityAt = Date.now();
    Logger.log('info', {
      message: 'agentSession:transition',
      params: { chatRoomID, newState },
    });
    return session;
  },

  /**
   * Delete a session (user ends conversation)
   */
  destroy(chatRoomID) {
    sessions.delete(chatRoomID);
  },

  /**
   * Get all active session stats (for monitoring)
   */
  getStats() {
    return {
      totalSessions: sessions.size,
      sessions: Array.from(sessions.values()).map(s => ({
        chatRoomID: s.chatRoomID,
        state: s.state,
        tenantID: s.tenantID,
        ageMs: Date.now() - s.createdAt,
      })),
    };
  },
};

module.exports = { agentSession };
