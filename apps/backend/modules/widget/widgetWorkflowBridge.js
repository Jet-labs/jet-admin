/**
 * Widget-Workflow Bridge
 * 
 * Manages the connection between widgets and workflows:
 * - Tracks widget subscriptions to workflow instances
 * - Streams raw workflow context to connected widgets in real-time
 * - Handles bidirectional communication
 *
 * NOTE: This bridge is intentionally UI-agnostic. It does NOT resolve
 * templates or process widget configs. All template resolution and
 * data transformation happens on the frontend (evaluationEngine +
 * widgets-logic builders).
 */
const Logger = require("../../utils/logger");
const { socketIO } = require("../../config/socket.io");

// In-memory store for widget-workflow connections
// In production, consider Redis for horizontal scaling
const widgetConnections = new Map(); // Map<widgetID, { instanceID, socketId, status, ... }>
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
        metadata,
      },
    });

    // Store widget connection for tracking only (no UI config needed)
    widgetConnections.set(widgetID, {
      instanceID,
      socketId: socket.id,
      status: 'connected',
      connectedAt: new Date().toISOString(),
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
   * Emit context update to all widgets subscribed to an instance.
   * Called by orchestrator when context changes.
   * Sends raw context only — frontend handles all resolution.
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

    for (const widgetID of widgets) {
      socketIO.to(`widget:${widgetID}`).emit('widget_context_update', {
        widgetID,
        instanceID,
        update,
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
      socketIO.to(`widget:${widgetID}`).emit('widget_workflow_status', {
        widgetID,
        instanceID,
        status,
        finalContext,
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

