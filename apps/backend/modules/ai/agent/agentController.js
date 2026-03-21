/**
 * AgentController
 * Bridge between Socket.IO events and the AgentExecutor.
 * Routes incoming socket events to the correct handler.
 */

const Logger = require('../../../utils/logger');
const { agentSession } = require('./agentSession');
const { datasourceDiscovery } = require('./datasourceDiscovery');
const { executeTurn, resumeAfterApproval } = require('./agentExecutor');
const { widgetPromoter } = require('./widgetPromoter');

const agentController = {

  /**
   * Handle initial user message → start agent session
   */
  async handleUserMessage({ socket, chatRoomID, tenantID, userID, message }) {
    Logger.log('info', {
      message: 'agentController:handleUserMessage',
      params: { chatRoomID, tenantID },
    });

    const socketEmit = (event, data) => {
      socket.to(chatRoomID).emit(event, data);
      socket.emit(event, data);
    };

    try {
      // Create or get session
      let session = agentSession.get(chatRoomID);
      if (!session || session.state === 'done') {
        session = agentSession.create({
          chatRoomID,
          tenantID,
          userID,
          originalQuery: message,
        });
      }

      // Discover available datasources for this tenant
      const availableDatasources = await datasourceDiscovery.getAvailableDatasourceIDs({
        tenantID,
        userID,
      });

      agentSession.update(chatRoomID, {
        discoveredDatasources: availableDatasources,
      });

      // Transition to discovering state
      agentSession.transition(chatRoomID, 'discovering');

      // Add user message to OpenAI history
      agentSession.appendMessage(chatRoomID, {
        role: 'user',
        content: message,
      });

      socketEmit('agent:thinking', {
        chatRoomID,
        message: 'Analyzing your question and discovering datasources...',
      });

      // Start the ReAct loop
      const result = await executeTurn({ chatRoomID, socketEmit });

      // Handle the result
      if (result.type === 'error') {
        socketEmit('agent:error', { chatRoomID, error: result.error });
        return;
      }
      
      if (result.type === 'text') {
        agentSession.transition(chatRoomID, 'done');
        socketEmit('agent:response', {
          chatRoomID,
          narrative: session.narrativeSummary || result.text,
          keyMetrics: session.keyMetrics,
          vizType: session.selectedVizType,
          vizConfig: session.vizConfig,
          queryResults: session.queryResults,
          suggestedFollowUps: session.suggestedFollowUps,
        });
      }
      // If result.type === 'paused', the executor already emitted the approval event

    } catch (error) {
      Logger.log('error', {
        message: 'agentController:handleUserMessage:error',
        params: { chatRoomID, error: error.message },
      });
      socketEmit('agent:error', {
        chatRoomID,
        error: error.message,
      });
    }
  },

  /**
   * Handle datasource approval from user
   */
  async handleDatasourceApproval({ socket, chatRoomID, tenantID, userID, approvedIDs }) {
    Logger.log('info', {
      message: 'agentController:handleDatasourceApproval',
      params: { chatRoomID, approvedIDs },
    });

    const socketEmit = (event, data) => {
      socket.to(chatRoomID).emit(event, data);
      socket.emit(event, data);
    };

    try {
      socketEmit('agent:thinking', {
        chatRoomID,
        message: 'Datasources approved. Drafting queries...',
      });

      const result = await resumeAfterApproval({
        chatRoomID,
        approvalType: 'datasource_approval',
        approvalData: { approvedIDs },
        socketEmit,
      });

      if (result.type === 'error') {
        socketEmit('agent:error', { chatRoomID, error: result.error });
        return;
      }

      if (result.type === 'text') {
        const session = agentSession.get(chatRoomID);
        agentSession.transition(chatRoomID, 'done');
        socketEmit('agent:response', {
          chatRoomID,
          narrative: session?.narrativeSummary || result.text,
          keyMetrics: session?.keyMetrics,
          vizType: session?.selectedVizType,
          vizConfig: session?.vizConfig,
          queryResults: session?.queryResults,
          suggestedFollowUps: session?.suggestedFollowUps,
        });
      }

    } catch (error) {
      Logger.log('error', {
        message: 'agentController:handleDatasourceApproval:error',
        params: { chatRoomID, error: error.message },
      });
      socketEmit('agent:error', { chatRoomID, error: error.message });
    }
  },

  /**
   * Handle query approval from user
   */
  async handleQueryApproval({ socket, chatRoomID, tenantID, userID }) {
    Logger.log('info', {
      message: 'agentController:handleQueryApproval',
      params: { chatRoomID },
    });

    const socketEmit = (event, data) => {
      socket.to(chatRoomID).emit(event, data);
      socket.emit(event, data);
    };

    try {
      socketEmit('agent:thinking', {
        chatRoomID,
        message: 'Queries approved. Executing...',
      });

      const result = await resumeAfterApproval({
        chatRoomID,
        approvalType: 'query_approval',
        approvalData: {},
        socketEmit,
      });

      if (result.type === 'error') {
        socketEmit('agent:error', { chatRoomID, error: result.error });
        return;
      }

      if (result.type === 'text') {
        const session = agentSession.get(chatRoomID);
        agentSession.transition(chatRoomID, 'done');
        socketEmit('agent:response', {
          chatRoomID,
          narrative: session?.narrativeSummary || result.text,
          keyMetrics: session?.keyMetrics,
          vizType: session?.selectedVizType,
          vizConfig: session?.vizConfig,
          queryResults: session?.queryResults,
          suggestedFollowUps: session?.suggestedFollowUps,
        });
      }

    } catch (error) {
      Logger.log('error', {
        message: 'agentController:handleQueryApproval:error',
        params: { chatRoomID, error: error.message },
      });
      socketEmit('agent:error', { chatRoomID, error: error.message });
    }
  },

  /**
   * Handle widget promotion request
   */
  async handlePromoteToWidget({ socket, chatRoomID, tenantID, userID, widgetTitle }) {
    Logger.log('info', {
      message: 'agentController:handlePromoteToWidget',
      params: { chatRoomID, widgetTitle },
    });

    const socketEmit = (event, data) => {
      socket.to(chatRoomID).emit(event, data);
      socket.emit(event, data);
    };

    try {
      socketEmit('agent:thinking', {
        chatRoomID,
        message: 'Creating permanent widget...',
      });

      const result = await widgetPromoter.promote({
        chatRoomID,
        tenantID,
        userID,
        widgetTitle: widgetTitle || 'AI Generated Widget',
      });

      socketEmit('agent:widget_promoted', {
        chatRoomID,
        widgetID: result.widgetID,
        workflowID: result.workflowID,
        message: `Widget "${widgetTitle}" created successfully!`,
      });

    } catch (error) {
      Logger.log('error', {
        message: 'agentController:handlePromoteToWidget:error',
        params: { chatRoomID, error: error.message },
      });
      socketEmit('agent:error', { chatRoomID, error: error.message });
    }
  },

  /**
   * Handle follow-up question (re-use existing session)
   */
  async handleFollowUp({ socket, chatRoomID, tenantID, userID, message }) {
    Logger.log('info', {
      message: 'agentController:handleFollowUp',
      params: { chatRoomID },
    });

    const session = agentSession.get(chatRoomID);
    if (!session) {
      // No existing session — treat as new message
      return this.handleUserMessage({ socket, chatRoomID, tenantID, userID, message });
    }

    // Reset state for follow-up while keeping history
    agentSession.update(chatRoomID, {
      conceptualizedQueries: [],
      queryResults: {},
      selectedVizType: null,
      vizConfig: null,
      narrativeSummary: null,
      keyMetrics: null,
      suggestedFollowUps: null,
    });
    agentSession.transition(chatRoomID, 'idle');
    agentSession.transition(chatRoomID, 'discovering');

    // Add follow-up message to history (maintains conversation context)
    agentSession.appendMessage(chatRoomID, {
      role: 'user',
      content: message,
    });

    const socketEmit = (event, data) => {
      socket.to(chatRoomID).emit(event, data);
      socket.emit(event, data);
    };

    try {
      socketEmit('agent:thinking', {
        chatRoomID,
        message: 'Analyzing follow-up question...',
      });

      const result = await executeTurn({ chatRoomID, socketEmit });

      if (result.type === 'error') {
        socketEmit('agent:error', { chatRoomID, error: result.error });
        return;
      }

      if (result.type === 'text') {
        agentSession.transition(chatRoomID, 'done');
        socketEmit('agent:response', {
          chatRoomID,
          narrative: session.narrativeSummary || result.text,
          keyMetrics: session.keyMetrics,
          vizType: session.selectedVizType,
          vizConfig: session.vizConfig,
          queryResults: session.queryResults,
          suggestedFollowUps: session.suggestedFollowUps,
        });
      }

    } catch (error) {
      Logger.log('error', {
        message: 'agentController:handleFollowUp:error',
        params: { chatRoomID, error: error.message },
      });
      socketEmit('agent:error', { chatRoomID, error: error.message });
    }
  },

  /**
   * Handle session cancellation
   */
  handleCancel({ socket, chatRoomID }) {
    Logger.log('info', {
      message: 'agentController:handleCancel',
      params: { chatRoomID },
    });
    agentSession.destroy(chatRoomID);
    socket.to(chatRoomID).emit('agent:cancelled', { chatRoomID });
    socket.emit('agent:cancelled', { chatRoomID });
  },
};

module.exports = { agentController };
