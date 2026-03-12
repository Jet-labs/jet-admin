/**
 * Widget-Workflow Bridge
 * 
 * Manages the connection between widgets and workflows:
 * - Tracks widget subscriptions to workflow instances
 * - Streams processed, chart-ready data to connected widgets in real-time
 * - Handles bidirectional communication
 */
const Logger = require('../../utils/logger');
const { socketIO } = require('../../config/socket.io');
const { processWorkflowDataForWidget } = require('@jet-admin/widgets-logic');
const { resolveTemplate } = require('../../utils/templateEngine/resolver');

// In-memory store for widget-workflow connections
// In production, consider Redis for horizontal scaling
const widgetConnections = new Map(); // Map<widgetID, { instanceID, socketId, status, widgetConfig, ... }>
const instanceWidgets = new Map();   // Map<instanceID, Set<widgetID>>

/**
 * Widget-Workflow Bridge API
 */
const widgetWorkflowBridge = {
  
  /**
   * Register a widget's connection to a workflow instance
   * @param {string} widgetID - Widget ID
   * @param {string} instanceID - Workflow instance ID
   * @param {object} socket - Socket.IO socket
   * @param {object} metadata - Additional connection metadata including widget config
   */
  registerWidget(widgetID, instanceID, socket, metadata = {}) {
    Logger.log('info', {
      message: 'widgetWorkflowBridge:registerWidget',
      params: { 
        widgetID, 
        instanceID, 
        socketId: socket.id, 
        hasWidgetType: !!metadata.widgetType,
        metadata,
      },
    });

    // Store widget connection with generic configuration for data processing
    // widgetConfig is an opaque blob — only widgets-logic knows its internals
    widgetConnections.set(widgetID, {
      instanceID,
      socketId: socket.id,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      widgetType: metadata.widgetType,
      widgetConfig: metadata.widgetConfig,
      workflowConfig: metadata.workflowConfig,
      ...metadata,
    });

    // Track instance-to-widgets mapping
    if (!instanceWidgets.has(instanceID)) {
      instanceWidgets.set(instanceID, new Set());
    }
    instanceWidgets.get(instanceID).add(widgetID);

    Logger.log('info', {
      message: 'widgetWorkflowBridge:registerWidget:complete',
      params: { 
        widgetID, 
        instanceID, 
        totalWidgetsForInstance: instanceWidgets.get(instanceID).size,
        allInstances: Array.from(instanceWidgets.keys()),
      },
    });

    // Join socket room for this widget
    socket.join(`widget:${widgetID}`);
    // Also join the instance room for workflow updates
    socket.join(instanceID);

    return true;
  },

  /**
   * Update widget configuration
   * @param {string} widgetID - Widget ID
   * @param {object} config - New configuration { widgetType, widgetConfig, workflowConfig }
   */
  updateWidgetConfig(widgetID, config) {
    const connection = widgetConnections.get(widgetID);
    if (!connection) return false;

    if (config.widgetType) connection.widgetType = config.widgetType;
    if (config.widgetConfig) connection.widgetConfig = config.widgetConfig;
    if (config.workflowConfig) connection.workflowConfig = config.workflowConfig;

    return true;
  },

  /**
   * Unregister a widget's connection
   * @param {string} widgetID - Widget ID
   * @param {object} socket - Socket.IO socket (optional)
   */
  unregisterWidget(widgetID, socket = null) {
    Logger.log('info', {
      message: 'widgetWorkflowBridge:unregisterWidget',
      params: { widgetID },
    });

    const connection = widgetConnections.get(widgetID);
    if (!connection) return false;

    const { instanceID } = connection;

    // Leave socket rooms
    if (socket) {
      socket.leave(`widget:${widgetID}`);
      socket.leave(instanceID);
    }

    // Remove from instance-to-widgets mapping
    if (instanceWidgets.has(instanceID)) {
      instanceWidgets.get(instanceID).delete(widgetID);
      if (instanceWidgets.get(instanceID).size === 0) {
        instanceWidgets.delete(instanceID);
      }
    }

    // Remove widget connection
    widgetConnections.delete(widgetID);

    return true;
  },

  /**
   * Get all widgets subscribed to a workflow instance
   * @param {string} instanceID - Workflow instance ID
   * @returns {string[]} Array of widget IDs
   */
  getWidgetsForInstance(instanceID) {
    const widgets = instanceWidgets.get(instanceID);
    return widgets ? Array.from(widgets) : [];
  },

  /**
   * Get the instance ID a widget is connected to
   * @param {string} widgetID - Widget ID
   * @returns {string|null} Instance ID or null
   */
  getInstanceForWidget(widgetID) {
    const connection = widgetConnections.get(widgetID);
    return connection ? connection.instanceID : null;
  },

  /**
   * Get connection details for a widget
   * @param {string} widgetID - Widget ID
   * @returns {object|null} Connection details or null
   */
  getWidgetConnection(widgetID) {
    return widgetConnections.get(widgetID) || null;
  },

  /**
   * Process context data for a widget based on its configuration.
   * 
   * Widget-type-agnostic pipeline:
   * 1. Resolve all {{ctx.*}} templates in widgetConfig using backend template engine
   * 2. Delegate to widgets-logic processWorkflowDataForWidget (which extracts type-specific fields)
   * 3. Return complete, renderable processedData
   * 
   * @param {object} context - Raw workflow context
   * @param {object} config - Generic widget configuration { widgetType, widgetConfig, workflowConfig }
   * @returns {object} Processed data ready for rendering, or null
   */
  processContextForWidget(context, config) {
    const { widgetType, widgetConfig, workflowConfig } = config;
    Logger.log('info', {
      message: 'widgetWorkflowBridge:processContextForWidget',
      params: { widgetType, hasWidgetConfig: !!widgetConfig, hasWorkflowConfig: !!workflowConfig },
    });

    if (!widgetConfig) {
      Logger.log('info', {
        message: 'widgetWorkflowBridge:processContextForWidget:noWidgetConfig',
        params: { widgetType },
      });
      return null;
    }

    try {
      // Step 1: Resolve all {{ctx.*}} templates in widgetConfig using the backend template engine
      // This is a deep resolve — handles nested objects, arrays, strings
      const resolvedWidgetConfig = resolveTemplate(widgetConfig, { ctx: context }, {
        preserveSingleExpressionType: true,
      });
      Logger.log('info', {
        message: 'widgetWorkflowBridge:processContextForWidget:resolvedWidgetConfig',
        params: { widgetType, resolvedWidgetConfig },
      });

      // Step 2: Delegate to widgets-logic (sole owner of widget-type-specific logic)
      return processWorkflowDataForWidget({
        widgetType: widgetType || 'vega-lite',
        widgetConfig: resolvedWidgetConfig,
      });
    } catch (error) {
      Logger.log('error', {
        message: 'widgetWorkflowBridge:processContextForWidget:error',
        params: { error: error.message, widgetType },
      });
      return null;
    }
  },

  /**
   * Emit context update to all widgets subscribed to an instance
   * Called by orchestrator when context changes
   * NOW PROCESSES DATA in real-time for each widget
   * @param {string} instanceID - Workflow instance ID
   * @param {object} update - Context update payload
   */
  emitContextUpdate(instanceID, update) {
    const widgets = this.getWidgetsForInstance(instanceID);
    
    if (widgets.length === 0) {
      Logger.log('info', {
        message: 'widgetWorkflowBridge:noWidgetsForInstance',
        params: { instanceID },
      });
      return;
    }

    Logger.log('info', {
      message: 'widgetWorkflowBridge:emitContextUpdate',
      params: { instanceID, widgetCount: widgets.length, updateType: update.type },
    });

    const contextSnapshot = update.contextSnapshot;
    Logger.log('info', {
      message: 'widgetWorkflowBridge:emitContextUpdate:contextSnapshot',
      params: { instanceID, hasContextSnapshot: !!contextSnapshot },
    });

    for (const widgetID of widgets) {
      const connection = widgetConnections.get(widgetID);
      Logger.log('info', {
        message: 'widgetWorkflowBridge:emitContextUpdate:widget',
        params: { widgetID, connection },
      });
      
      // Process context for this widget using generic config
      let processedData = null;
      if (connection && contextSnapshot) {
        processedData = this.processContextForWidget(contextSnapshot, {
          widgetType: connection.widgetType,
          widgetConfig: connection.widgetConfig,
          workflowConfig: connection.workflowConfig,
        });
      }

      socketIO.to(`widget:${widgetID}`).emit('widget_context_update', {
        widgetID,
        instanceID,
        update: {
          ...update,
          // Include processed, chart-ready data if available
          processedData,
        },
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Emit workflow status change to all widgets subscribed to an instance
   * @param {string} instanceID - Workflow instance ID
   * @param {string} status - New workflow status
   * @param {object} finalContext - Final context data (if completed)
   */
  emitWorkflowStatus(instanceID, status, finalContext = null) {
    const widgets = this.getWidgetsForInstance(instanceID);
    
    if (widgets.length === 0) return;

    Logger.log('info', {
      message: 'widgetWorkflowBridge:emitWorkflowStatus',
      params: { instanceID, status, widgetCount: widgets.length },
    });

    for (const widgetID of widgets) {
      const connection = widgetConnections.get(widgetID);
      
      // Process final context for this widget using generic config
      let processedData = null;
      if (connection && finalContext) {
        processedData = this.processContextForWidget(finalContext, {
          widgetType: connection.widgetType,
          widgetConfig: connection.widgetConfig,
          workflowConfig: connection.workflowConfig,
        });
      }

      socketIO.to(`widget:${widgetID}`).emit('widget_workflow_status', {
        widgetID,
        instanceID,
        status,
        finalContext,
        // Include processed, chart-ready data
        processedData,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Emit error to specific widget
   * @param {string} widgetID - Widget ID
   * @param {object} error - Error details
   */
  emitError(widgetID, error) {
    Logger.log('error', {
      message: 'widgetWorkflowBridge:emitError',
      params: { widgetID, error },
    });

    socketIO.to(`widget:${widgetID}`).emit('widget_workflow_error', {
      widgetID,
      error,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Get connection statistics
   * @returns {object} Stats about current connections
   */
  getStats() {
    return {
      totalWidgetConnections: widgetConnections.size,
      totalInstanceSubscriptions: instanceWidgets.size,
      connections: Array.from(widgetConnections.entries()).map(([widgetID, conn]) => ({
        widgetID,
        instanceID: conn.instanceID,
        status: conn.status,
        connectedAt: conn.connectedAt,
        widgetType: conn.widgetType,
        hasWidgetConfig: !!conn.widgetConfig,
      })),
    };
  },

  /**
   * Clean up stale connections (for maintenance)
   * @param {number} maxAgeMs - Maximum connection age in milliseconds
   */
  cleanupStaleConnections(maxAgeMs = 3600000) { // 1 hour default
    const now = Date.now();
    let cleaned = 0;

    for (const [widgetID, connection] of widgetConnections.entries()) {
      const connectedAt = new Date(connection.connectedAt).getTime();
      if (now - connectedAt > maxAgeMs) {
        this.unregisterWidget(widgetID);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.log('info', {
        message: 'widgetWorkflowBridge:cleanedStaleConnections',
        params: { cleaned },
      });
    }

    return cleaned;
  },
};

module.exports = { widgetWorkflowBridge };

